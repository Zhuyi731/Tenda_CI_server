/**
 * @author zhuyi
 * @desc 此文件所在层级位于服务器Controller层，用于处理逻辑。
 * 所有的逻辑处理放在这一层，不要放入API处理中，API层只处理数据。同理，这一层不要对数据进行处理
 * @license MIT license
 * @Version V1.0.0
 * @title CI集成逻辑处理
 */
const dbModal = require("../../datebase_mysql/dbModal");
const path = require("path");
//引入数据库
const db = require("../../datebase_mysql/db.js");
//引入自动检测机制
const Product = require("../product/product");
//引入SVN类
const SVN = require("../../svn_server/svn");
const managers = require("../../config/basic_config").managers;
//引入管理product类的管理类
const productManager = require("../product/productManager");
const util = require("../Util/util");
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
                    dbModal.tableModals.Product.findAll({
                        attributes: [
                            [Sequelize.literal("DISTINCT `productLine`"), "productLine"]
                        ]
                    }),
                    dbModal.tableModals.User.findAll({ attributes: ["mail", "name"] })
                ])
                .then(values => {
                    resolve({
                        productLines: util.dealDataValues(values[0]),
                        allMembers: util.dealDataValues(values[1])
                    });
                })
                .catch(err => {
                    console.log(err);
                    reject(err)
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
                    dbModal.tableModals.User.findAll({
                        attributes: ["name", "mail"]
                    }),
                    dbModal.tableModals.Product.findAll({
                        include: [{
                            model: dbModal.tableModals.ProductCopyTo,
                            as: "copyTo",
                            attributes: ["copyTo"]
                        }, {
                            model: dbModal.tableModals.ProductMember,
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
                .then((res) => {
                    return that._updateStatusInDB(args);
                })
                .then(() => {
                    productManager.push(new Product(args));
                    resolve({
                        status: "ok"
                    });
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    /**
     * 获取能够编译的product
     */
    getCompileProducts() {
        let that = this;
        return new Promise((resolve, reject) => {
            db.get("*", "product", "compiler!='none'")
                .then((values) => {
                    let products = [].slice.call(values.rows),
                        ret = {
                            products: []
                        },
                        i;

                    resolve({
                        status: "ok",
                        products
                    });
                })
                .catch(err => {
                    reject({
                        status: "error",
                        errMessage: err
                    });
                })
        });
    }

    /**
     * 修改产品配置
     * @param {*参数} args 
     */
    editProduct(args) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._isSrcValid(args.src)
                .then(() => {
                    if (args.key != args.product) {
                        return that._isProductExist(args);
                    } else {
                        return;
                    }
                })
                .then(() => {
                    return that._updateStatusInDB(args);
                })
                .then((result) => {
                    resolve({
                        status: "ok"
                    });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    _updateStatusInDB(args) {
        //interval是数据库关键字  要加``
        args = this._parseProductData(args);
        let updateFields = ["product", "productLine", "isMultiLang", "langPath", "compiler", "compileOrder", "src", "localDist", "dist", "`interval`", "status"],
            insertSQL = `INSERT INTO product(${updateFields.join(',')}) values(${new Array(updateFields.length).fill("?").join(",")})`,
            membersArgs = "('" + args.product + "','" + args.members.join(`'),('${args.product}','`) + "')",
            copyToArgs = "('" + args.product + "','" + args.copyTo.join(`'),('${args.product}','`) + "')",
            insertArgs = updateFields.map(prop => {
                prop == "`interval`" && (prop = "interval");
                return args[prop];
            }),
            that = this;

        return new Promise((resolve, reject) => {
            Promise.resolve()
                .then(() => {
                    if (!!args.key) {
                        return db.del("product", `product='${args.key}'`);
                    } else {
                        return;
                    }
                })
                .then(() => {
                    if (!!args.key) {
                        return db.del("productcopyto", `product='${args.key}'`);
                    } else {
                        return;
                    }
                })
                .then(() => {
                    if (!!args.key) {
                        return db.del("productmember", `product='${args.key}'`);
                    } else {
                        return;
                    }
                })
                .then(() => {
                    return db.query(insertSQL, insertArgs);
                })
                .then(() => {
                    return db.insert("productmember", ["product", "member"], membersArgs);
                })
                .then(() => {
                    return db.insert("productcopyTo", ["product", "copyTo"], copyToArgs);
                })
                .then(() => {
                    resolve();
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    _parseProductData(args) {
        args.startTime = parseInt(args.startTime);
        args.interval = parseInt(args.interval);
        if (args.copyTo.length == 0) {
            args.copyTo = managers;
        } else {
            args.copyTo = Array.from(new Set([...args.copyTo, ...managers]));
        }
        return args;
    }


    /**
     * 调用SVN类的方法检查在SVN服务器上是否存在该路径
     * @param {*svn上的路径} src 
     */
    _isSrcValid(src) {
        return new Promise((resolve, reject) => {
            SVN.prototype
                .checkSrc(src)
                .then(() => {
                    resolve()
                })
                .catch(err => {
                    reject(err)
                });
        });
    }

    /**
     * 检查需要创建的产品是否已经存在于数据S库中
     * @param {*产品的参数} args
     * @return {true:代表通过测试} {false:代表失误} 
     */
    _isProductExist(args) {
        let that = this;
        return new Promise((resolve, reject) => {
            //检查在产品目录是否已经存在
            // db.get("*", "product", `product='${args.product}'`)
            dbModal.tableModals.User
                .findOne({
                    where: {
                        "product": { "$eq": `${args.product}` }
                    }
                })
                .then(values => {
                    if (values.rows.length > 0) {
                        reject({
                            status: "error",
                            errMessage: "该项目已经存在"
                        });
                    } else {
                        resolve({
                            status: "ok"
                        });
                    }
                }).catch(err => {
                    reject(err);
                });
        });
    }
}
module.exports = new CIControl();