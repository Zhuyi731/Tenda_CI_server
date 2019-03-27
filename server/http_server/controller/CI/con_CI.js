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
//引入管理product类的管理类
const productManager = require("../../models/CI/productManager");

const Mailer = require("../../../mail_server/mail")
const util = require("../../util/util");
const Sequelize = require("sequelize");
const _ = require("lodash");
const ejsExcel = require("ejsExcel");
const fs = require("fs");
const xlsx = require("node-xlsx");

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
    /**
     * 得到所有的成员姓名和mail
     */
    getAllMembers() {
        return new Promise((resolve, reject) => {
            dbModel.tableModels.User
                .findAll({attributes: ["mail", "name"]})
                .then(value => {
                    resolve({
                        status: 'ok',
                        members: value
                    })
                })
                .catch(err => {
                    reject({
                        status: "error",
                        errMessage: err.message
                    });
                });
        })
    }

    /**
     * 添加转测 checklist 
     * @param {*流程的参数} args
     * 
     */
    setProcedure(args) {
        this.mailer = new Mailer();
        var that = this;
        args.procedure.submit = args.userName;
        args.remarks = args.remarks + "    "+ "提交人：" + args.userName+"提交时间"+ new Date()+"/n";
        
        // 判断负责人数
        if (args.procedure.response.split(",").length > 1) {
            args.procedure.status = "resubmit";
        }

        return new Promise((resolve, reject) => {
            that._updateTableInDB(args)
                .then(() => {
                    return that._selectId(args['checklist']);
                })
                .then(value => {

                    if (that._ifSubmitAll(value.response, value.submit) == true) {
                        // 发邮件 
                        that._sendMail(value);
                    }

                    resolve({
                        status: "ok"
                    });
                })
                .then({

                })
                .catch(err => {
                    console.log(err);
                    reject({
                        err: "1"
                    });
                });
        });
    }

    /**
     * 插入数据
     * @param {*} args 
     */
    _updateTableInDB(args) {
        //    var data = [{ name: "O3V1.0", response: "ycm,yh", mailto: "ycm", remark: "pengjuanli", status: "submit" }];
        var data = []
        data[0] = args.procedure;
        return new Promise((resolve, reject) => {
            dbModel.tableModels.Procedure.bulkCreate(data)
                .then(resolve)
                .catch(err => {
                    console.info("插入数据库时出现错误");
                    reject(err);
                })
        })
    }

    /**
     * 查询新插入的数据的id
     */
    _selectId(data ) {
        var that = this;

        return new Promise((resolve, reject) => {
            //检查
            dbModel.tableModels.Procedure
                .findAll({
                    'order': [
                        ['id', 'DESC']
                    ]
                })
                .then(values => {
                    return that._createExcel(data, values[0].dataValues);
                })
                .then(value=>{
                    resolve(value)
                })
                .catch(err => {
                    console.log(err);
                    reject();
                });
        });
    }

    /**
     * 保存 checklist 数据为xlsx表格
     * @param {xlsx数据} data 
     * @param {流程的id} id 
     */
    _createExcel(data, value) {
        
        var exlBuf = fs.readFileSync("../resourcecs/checklist/checklist.xlsx");
        var path = "../resourcecs/checklist/checklist" + value.id + ".xlsx";

        return new Promise((resolve,reject)=>{
            ejsExcel.renderExcelCb(exlBuf, data, function(err, exlBuf2) {
                if (err) {
                    reject(err);
                    return;
                }
                fs.writeFileSync(path, exlBuf2);
                console.log("生成checklist" + value.id + ".xlsx");
                resolve(value);
                
            });
        });
    }

    /**
     * 
     * @param {value} 列表值 
     */
    _sendMail(value) {
        this.mailer = new Mailer();
        var that = this;
        var path = "../resourcecs/checklist/checklist" + value.id + ".xlsx";

        console.log("邮件发送给" + value.teacher);
        console.log("邮件抄送给" + value.response);

        return new Promise((resolve, reject) => {
            that.mailer.mailWithTemplate({
                    to: ['yangchunmei'], //value.teacher
                    copyTo: [''], //value.response
                    subject: `checklist表流程`,
                    attachments: [{
                        filename: `checklist${value.id}.xlsx`,
                        path: path
                    }],
                    template: "checklist",
                    templateOptions: {
                        msg: "提交checklist流程，请查收",
                        name: `${value.name}`,
                        response: `${value.submit}`
                    }
                })
                .then(() => {
                    resolve({
                        status: "ok"
                    });
                })
                .catch(err => {
                    console.log(err);
                    reject({
                        err: "1"
                    });
                })
        });
    }


    /**
     * 查询 checklist 表
     * @param {需要查询的状态} args.status
     * @param {查询人 只能查询本人相关的数据} args.userName
     */
    getHandleList(args) {

        var that = this;
        that.status = args.status;
        that.userMail = args.userMail;
        // admin 用户可以查看全部 
        if(that.userMail == "admin"){
            that.userMail = "";
        }
        that.userName = args.userName;
        var status1 = "ending";
        if (that.status == "pending") {
            status1 = "resubmit"
        }
        return new Promise((resolve, reject) => {
            Promise.all([
                    dbModel.tableModels.Procedure
                    .findAll({
                        where: {
                            $or: [
                            {
                                status: {
                                    "$in": [`${that.status}`, `${status1}`]
                                },
                                response: {
                                    "$like": `%${that.userMail}%`
                                }
                            }, {
                                status: {
                                    "$eq": `${that.status}`
                                },
                                teacher: {
                                    "$like": `%${that.userMail}%`
                                }
                            }]
                        }
                    }),
                    dbModel.tableModels.User
                    .findAll({attributes: ["mail", "name"]})

                ])

                .then(value => {
                    var HandleLists = {};
                    if (value[0] != undefined) {
                        HandleLists = value[0].map(HandleList => {
                            let list = HandleList.dataValues;
                            list.checklistData = that._checklistData(list.id) || "";
                            return list;
                        });
                    }
                    resolve({
                        status: "ok",
                        HandleLists,
                        members:value[1],
                        name:that.userName
                    });
                })
                .catch(err => {
                    reject({
                        err: '111'
                    });
                });
        });
    }

    /**
     * 
     * @param {*} args  提交过来的数据  主要提交表格数据 根据提交人来判断是否所有人提交完成
     */
    handleSubmit(args) {
        var data = args;
        if(data.submit == ""){
            data.submit = data.userName;
        }else{
            data.submit = data.submit + "," + data.userName;
        }
      
        data.remarks = data.remarks + "    "+ "提交人：" + data.userName+"提交时间"+ new Date() +"/n";
        var data = args;

        // 如果所有人提交完成  改变流程状态  发送邮件

        if (this._ifSubmitAll(data.response, data.submit) == true) {
            data.status = "pending";
            this._sendMail(data);
        } else {
            data.status = "resubmit";
        }

        let updataObj = { status: `${data.status}`, submit: `${data.submit}` },
            where = {
                id: {
                    "$eq": `${data.id}`
                }
            };

        return new Promise((resolve, reject) => {
            dbModel.tableModels.Procedure.update(updataObj, { where })
                .then(() => {
                    resolve({ status: "ok", message: "成功" });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    _ifSubmitAll(response, submit) {
        response = response.split(",");
        submit = submit.split(",");
        if (response.length == submit.length) {
            return true;
        }
        return false;

    }
    /**
     * 取得 checklist.xlsx数据
     * @param {流程表的id} id 
     */
    _checklistData(id) {
        var checklistData = [];
        var data = [];
        var path = "../resourcecs/checklist/checklist" + id + ".xlsx";
        var i;

        var dataexecl = xlsx.parse(path) || "";
        data = dataexecl[0].data || "";
        if (data != "") {
            for (i = 3; i < 21; i++) {
                checklistData[i - 3] = {};
                checklistData[i - 3].ifchecked = data[i][4] || "";
                checklistData[i - 3].response = data[i][5] || "";
                checklistData[i - 3].remarks = data[i][6] || "";
            }
        }

        return checklistData;
    }

    /**
     * 改变流程状态  通过 or 驳回
     * 得到当前修改人姓名 加入评审意见中
     * @param {需要修改的状态} args.status
     * @param {需要修改的评审意见} args.opinion
     * @param {当前修改人} args.userName
     */

    handleProcedure(args) {
        this.mailer = new Mailer();
        var that = this;

        var data = args;
        data.date = new Date();
        var path = "../resourcecs/checklist/checklist" + data.id + ".xlsx";
        data.opinion = data.opinion + "审核人： " + data.userName + "审核时间"+ data.date +"/n";
        let updataObj = { status: `${data.status}`, opinion: `${data.opinion}` },
            where = {
                id: {
                    "$eq": `${data.id}`
                }
            };
        /**
         *   状态变为 ending  则发送后 mail人选 
         *   状态变为 resubmit   则发送给负责人重新提交 `${data.status}` 置空列表的提交人
         */
        if (data.status == "ending") {
            data.msg = "项目的checklist如附件，请查收"
        } else {
            data.msg = "项目的checklist流程被驳回，请登陆CI查看审核意见，并重新提交";
            updataObj.submit = "";
        }

        return new Promise((resolve, reject) => {
            dbModel.tableModels.Procedure.update(updataObj, { where })
                .then(() => {

                    return that.mailer.mailWithTemplate({
                        to: ['yangchunmei'],
                        copyTo: ['yangchunmei'],
                        subject: `checklist表流程`,
                        attachments: [{
                            filename: `checklist${data.id}.xlsx`,
                            path: path
                        }],
                        template: "checklist",
                        templateOptions: {
                            msg: `${data.msg}`,
                            name: `${data.name}`,
                            response: `${data.response}`
                        }
                    });
                })
                .then(() => {
                    resolve({ status: "ok", message: "成功" });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}


module.exports = new CIControl();