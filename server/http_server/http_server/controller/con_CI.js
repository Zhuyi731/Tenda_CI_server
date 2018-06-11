const path = require("path");
//引入数据库
const db = require("../../datebase_mysql/db.js");
//引入自动检测机制
const Product = require("../auto_test_server/product");
//引入SVN类
const SVN = require("../../svn_server/svn");
const managers = require("../../config/basic_config").managers;
const productManager = require("../auto_test_server/productManager");
/**
 * 用于处理数据库返回的数据,
 * @param {*数据库返回的数据} rows 
 */
function dealRowData(rows) {
    let obj = {},
        prop;

    return rows.map((data) => {
        obj = {};
        for (pro in data) {
            if (data.hasOwnProperty(pro)) {
                obj[pro] = data[pro];
            }
        }
        return obj;
    });
}

function pf() {
    console.log("");
    console.log("/****************下列项目正在运行*************************/");
    productManager.products.forEach(prod => {
        console.log("\tName:%s", prod.name);
        console.log("\tTimer:%s", prod.timer);
        console.log("\tRunning Status:%s", prod.isRunning);
    });
}



class CIControl {

    /**
     * /api/getProLine 对应的动作
     * @return  resolve所有产品线的数据
     * @return resolve所有小组成员的数据
     */
    getAllLine() {
        return new Promise((resolve, reject) => {
            //查询  产品线以及用户信息
            Promise.all([db.query("SELECT DISTINCT productLine FROM product", ""), db.get(["mail", "name"], "users")]).then((values) => {
                let ret = {
                    productLines: dealRowData(values[0].rows),
                    allMembers: dealRowData(values[1].rows)
                }
                resolve(ret);
            }).catch(err => {
                console.log(err);
                reject(err)
            });
        });


    };

    /**
     * /api/getAllProducts
     * @return 返回所有产品的数据
     */
    getAllProducts() {
        return new Promise((resolve, reject) => {
            //获取项目数据以及抄送成员等信息
            Promise.all([db.get("*", "product"), db.get(["a.*,b.name"], "productmember a,users b", "a.member=b.mail"), db.get(["a.*,b.name"], ["productcopyto a", "users b"], "a.copyTo=b.mail")]).then(values => {
                let products = [].slice.call(values[0].rows),
                    members = dealMembers(values[1].rows),
                    copyTos = dealCopyTos(values[2].rows),
                    ret = {
                        products: []
                    },
                    i;

                products.forEach((pro, index) => {
                    products[index].members = members[products[index].product];
                    products[index].copyTo = copyTos[products[index].product] || [];
                }, this);

                resolve({
                    status: "ok",
                    products
                })
            });
        }).catch((err) => {
            reject({
                status: "error",
                errMessage: err
            })
        });

        function dealCopyTos(arr) {
            let tmp = {};
            if (!arr) return [];
            [].slice.call(arr).forEach(el => {
                if (!tmp[el.product]) {
                    tmp[el.product] = [el.copyTo];
                } else {
                    tmp[el.product].push(el.copyTo);
                }
            });
            return tmp;
        }
        /**
         * 转换members数据
         * @param {*} arr 
         * @param {*} type 
         */
        function dealMembers(arr) {
            let tmp = {};
            if (!arr) return [];
            [].slice.call(arr).forEach(el => {
                if (!tmp[el.product]) {
                    tmp[el.product] = [{
                        mail: el.member,
                        name: el.name
                    }];
                } else {
                    tmp[el.product].push({
                        mail: el.member,
                        name: el.name
                    });
                }
            });
            return tmp;
        }

    }

    /**
     * @param{args} 插入数据库的参数
     * 新建一个项目之后，立即放入检测队列中
     */
    newProLine(args) {
        let that = this;
        return new Promise((resolve, reject) => {
            //interval是数据库关键字  要加``
            let insertSQL = "INSERT into product(product,productLine,isOld,startTime,compiler,compileOrder,src,localDist,dist,schedule,`interval`,remarks,status) values(?,?,?,?,?,?,?,?,?,?,?,?,?)"
            let insertArgs = [args.product, args.productLine, ~~args.isOld, parseInt(args.startTime), args.compiler, args.compileOrder, args.src, args.localDist, args.dist, args.schedule, ~~args.interval, args.remarks, "running"];

            let membersArgs = "('" + args.product + "','" + args.members.join(`'),('${args.product}','`) + "')";
            if (args.copyTo.length == 0) {
                args.copyTo = managers;
            } else {
                args.copyTo = Array.from(new Set([...args.copyTo, ...managers]));
            }
            let copyToArgs = "('" + args.product + "','" + args.copyTo.join(`'),('${args.product}','`) + "')";

            /**
             * 1.首先检查参数正确性
             * 2.插入数据库中
             * 这里的插入操作不能写成promise,只能当做回调执行
             * 
             */
            that.isProductExist(args)
                .then(() => {
                    return that.isSrcValid(args.src);
                })
                .then((res) => {
                    //必须在then内部执行，保证isProductExist函数执行完毕
                    if (res.status == "ok") {
                        //开启一个事务，保证三个插入操作完整执行   
                        db.query("BEGIN")
                            .then(() => {
                                return db.query("SET AUTOCOMMIT=0");
                            }) //设置自动执行   因为member和copyto中有外键约束
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
                                return db.query("COMMIT");
                            })
                            .then(() => {
                                resolve({
                                    status: "ok"
                                });
                                let product = new Product(args);
                                productManager.push(product);
                            }).catch((res) => {
                                //事务不成功，回滚
                                db.query("ROLLBACK");
                                reject(res);
                            });
                    } else {
                        reject(res);
                    }
                }).catch(err => {
                    console.log(err)
                    reject(err);
                });


        });
    };


    editProduct(args) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.isSrcValid(args.src)
                .then(() => {
                    if (args.key != args.product) {
                        return that.isProductExist(args);
                    } else {
                        return;
                    }
                })
                .then(() => {
                    return upDateProductInfo(args);
                })
                .then((result) => {
                    resolve({
                        status: "ok"
                    });
                }).catch(err => {
                    reject(err);
                });
        });
        /**
         * 当选择修改项目信息时
         * @param {*} resolve 
         */
        function upDateProductInfo(args) {
            let that = this,
                updateField = ["product", "productLine", "isOld", "startTime", "compiler", "compileOrder", "src", "localDist", "dist", "schedule", "`interval`", "remarks", "status"],
                updateValues = [args.product, args.productLine, args.isOld, args.startTime, args.compiler, args.compileOrder, args.src, args.localDist, args.dist, args.schedule, args.interval, args.remarks, args.status];
            return db.update("product", updateField, updateValues, `product='${args.key}'`);
        }
    }

    isSrcValid(src) {
        return new Promise((resolve, reject) => {
            SVN.prototype.checkSrc(src)
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
    isProductExist(args) {
        let that = this;
        return new Promise((resolve, reject) => {
            //检查在产品目录是否已经存在
            db.get("*", "product", `product='${args.product}'`)
                .then((values) => {
                    if (values.rows.length > 0) {
                        reject({
                            status: "error",
                            errMessage: "产品已经存在"
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