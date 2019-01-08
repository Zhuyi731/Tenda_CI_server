/**
 * @author zhuyi
 * @desc 此文件所在层级位于服务器Controller层，用于处理逻辑。
 * 所有的逻辑处理放在这一层，不要放入API处理中，API层只处理数据。同理，这一层不要对数据进行处理
 * @license MIT license
 * @Version V1.0.0
 * @title CI集成逻辑处理
 */
//引入数据库
const dbModel = require("../../../datebase_mysql/dbModel");
//引入自动检测机制
const Product = require("../../models/CI/product");
//引入SVN类
const SVN = require("../../../svn_server/svn");
const managers = require("../../../config/basic_config").managers;
//引入管理product类的管理类
const productManager = require("../../models/CI/productManager");
const util = require("../../util/util");
const Sequelize = require("sequelize");
const _ = require("lodash");

class CIControl {
    /**
     * /api/getProLine 对应的动作
     * @return  resolve所有产品线的数据
     * @return resolve所有小组成员的数据
     */
    getAllLine() {
        return new Promise((resolve, reject) => {
            //查询  产品线以及用户信息
            Promise.all([
                    dbModel.tableModels.Product.findAll({
                        attributes: [
                            [Sequelize.literal("DISTINCT `productLine`"), "productLine"]
                        ]
                    }),
                    dbModel.tableModels.User.findAll({ attributes: ["mail", "name"] })
                ])
                .then(values => {
                    resolve({
                        productLines: util.dealDataValues(values[0]),
                        allMembers: util.dealDataValues(values[1])
                    });
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    /**
     * /api/getAllProducts
     * @return 返回所有产品的数据
     */
    getAllProducts() {
        return new Promise((resolve, reject) => {
            //获取项目数据以及抄送成员等信息
            Promise.all([
                    dbModel.tableModels.User.findAll({
                        attributes: ["name", "mail"]
                    }),
                    dbModel.tableModels.Product.findAll({
                        include: [{
                            model: dbModel.tableModels.ProductCopyTo,
                            as: "copyTo",
                            attributes: ["copyTo"]
                        }, {
                            model: dbModel.tableModels.ProductMember,
                            as: "member",
                            attributes: ["member"]
                        }]
                    })
                ])
                .then(result => {
                    let users = result[0].map(modal => modal.dataValues),
                        products = result[1];

                    products = products.map(product => {
                        let newProduct = product.dataValues,
                            copyTos = product.copyTo.map(el => {
                                let user = this._mapMailToName(users, el.copyTo);
                                return user;
                            }),
                            members = product.member.map(el => {
                                let user = this._mapMailToName(users, el.member);
                                return user;
                            });
                        newProduct.copyTos = copyTos;
                        newProduct.members = members;
                        return newProduct;
                    });

                    resolve({
                        status: "ok",
                        products
                    });
                })
                .catch(e => {
                    reject({
                        status: "error",
                        errMessage: e.toString()
                    });
                });
        });
    }

    _mapMailToName(users, mail) {
        return users.find(user => {
            return user.mail == mail;
        });
    }

    /**
     * @param{args} 插入数据库的参数
     * 新建一个项目之后，立即放入检测队列中
     * 1.首先检查参数正确性
     * 2.插入数据库中
     * 这里的插入操作不能写成promise,只能当做回调执行
     */
    newProLine(args) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._isProductExist(args)
                .then(() => {
                    return that._isSrcValid(args.src);
                })
                .then(() => {
                    return that._updateStatusInDB(args);
                })
                .then(() => {
                    productManager.push(new Product(args));
                    resolve({
                        status: "ok"
                    });
                })
                .catch(reject);
        });
    }

    /**
     * 获取能够编译的product
     */
    getCompileProducts() {
        return new Promise((resolve, reject) => {
            dbModel.tableModels.Product
                .findAll({
                    where: {
                        compiler: {
                            "$ne": "none"
                        }
                    }
                })
                .then(values => {
                    resolve({
                        status: "ok",
                        products: values.map(el => el.product)
                    });
                })
                .catch(err => {
                    reject({
                        status: "error",
                        errMessage: err.message
                    });
                });
        });
    }

    /**
     * 修改产品配置
     * @param {*参数} args 
     */
    editProduct(args) {
        return new Promise((resolve, reject) => {
            this._updateStatusInDB(args)
                .then(() => {
                    resolve({ status: "ok", message: "修改项目信息成功" });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    _updateStatusInDB(args) {
        //去重
        args.copyTos = Array.from(new Set([...args.copyTos, ...managers]));
        let updateObj = _.cloneDeep(args),
            members = args.members.map(el => {
                return {
                    product: args.product,
                    member: el,
                    mail: el
                };
            }),
            copyTos = args.copyTos.map(el => {
                return {
                    product: args.product,
                    copyTo: el,
                    mail: el
                }
            }),
            where = {
                product: {
                    "$eq": `${args.key}`
                }
            };

        return new Promise((resolve, reject) => {
            //删除原有数据
            dbModel.tableModels.ProductMember
                .destroy({ where })
                .then(() => {
                    return dbModel.tableModels.ProductCopyTo.destroy({ where });
                })
                .then(() => {
                    return dbModel.tableModels.Product.upsert(updateObj, { where });
                })
                .then(() => {
                    return dbModel.tableModels.ProductCopyTo.bulkCreate(copyTos);
                })
                .then(() => {
                    return dbModel.tableModels.ProductMember.bulkCreate(members);
                })
                .then(resolve)
                .catch(err => {
                    console.log(err);
                    reject();
                });
        });
    }

    /**
     * 调用SVN类的方法检查在SVN服务器上是否存在该路径
     * @param {*svn上的路径} src 
     */
    _isSrcValid(src) {
        return new Promise((resolve, reject) => {
            SVN
                .checkSrc(src)
                .then(resolve)
                .catch(err => {
                    reject({ status: "error", errMessage: err.message });
                });
        });
    }

    /**
     * 检查需要创建的产品是否已经存在于数据S库中
     * @param {*产品的参数} args
     * @return {true:代表通过测试} {false:代表失误} 
     */
    _isProductExist(args) {
        return new Promise((resolve, reject) => {
            //检查在产品目录是否已经存在
            dbModel.tableModels.Product
                .findOne({
                    where: {
                        "product": { "$eq": `${args.product}` }
                    }
                })
                .then(values => {
                    if (values) {
                        reject({
                            status: "error",
                            errMessage: "该项目已经存在"
                        });
                    } else {
                        resolve({
                            status: "ok"
                        });
                    }
                })
                .catch(err => {
                    reject({
                        status: "error",
                        errMessage: err.message
                    });
                });
        });
    }
}
module.exports = new CIControl();