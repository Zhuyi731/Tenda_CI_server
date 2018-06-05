const path = require("path");
//引入数据库
const db = require("../../datebase_mysql/db.js");
//引入自动检测机制
const Product = require("../auto_test_server/product");
//引入SVN类
const SVN = require("../../svn_server/svn");

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

/**
 * 将某个产品停止检测
 */
function stopProduct(name) {
    let pro = Product.prototype.products,
        i, len = pro.length;
    for (i = 0; i < len; i++) {
        if (pro[i].name == name) {
            pro[i].stop();
            pro[i] = null;
            pro[i].splice(i, 1);
            break;
        }
    }
}

function pf (){
    console.log("");
    console.log("/****************下列项目正在运行*************************/");
    Product.prototype.products.forEach(prod=>{
        console.log("\tName:%s",prod.name);
        console.log("\tTimer:%s",prod.timer);
        console.log("\tRunning Status:%s",prod.isRunning);
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
            resolve({
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
        return new Promise((resolve) => {
            //interval是数据库关键字  要加``
            let insertSQL = "INSERT into product(product,productLine,isOld,startTime,compiler,src,localDist,dist,schedule,`interval`,remarks,status) values(?,?,?,?,?,?,?,?,?,?,?,?)"
            let insertArgs = [args.product, args.productLine, ~~args.isOld, ~~args.startTime, args.compiler, args.src, args.localDist, args.dist, args.schedule, ~~args.interval, args.remarks, "running"];

            let membersArgs = "('" + args.product + "','" + args.members.join(`'),('${args.product}','`) + "')";
            let copyToArgs = false;
            if (args.copyTo && args.copyTo.length != 0) {
                copyToArgs = "('" + args.product + "','" + args.copyTo.join(`'),('${args.product}','`) + "')";
            }

            /**
             * 1.首先检查参数正确性
             * 2.插入数据库中
             * 这里的插入操作不能写成promise,只能当做回调执行
             * 
             */
            that.isProductExist(args)
                .then((res) => {
                    //必须在then内部执行，保证isProductExist函数执行完毕
                    if (res.status == "ok") {
                        db.query(insertSQL, insertArgs)
                            .then(db.insert("productMember", ["product", "member"], membersArgs))
                            .then(() => {
                                if (copyToArgs) {
                                    return db.insert("productCopyTo", ["product", "copyTo"], copyToArgs);
                                }
                                return;
                            })
                            .then(() => {
                                let product = new Product(args);
                                product.start();
                                Product.prototype.products.push[product];
                                resolve({
                                    status: "ok"
                                })
                            });
                    } else {
                        resolve(res);
                    }
                });


        });
    };


    editProduct(args) {
        let that = this;
        return new Promise((resolve, reject) => {
            //先把对应的之前的数据删除  在添加新的数据
            if (args.key != args.product) {
                that.isProductExist(args).then(result => {
                    if (result.status == "error") {
                        resolve(result);
                    } else {
                        updatePro(resolve);
                    }
                });
            } else {
                SVN.prototype.checkSrc(args.src).then(result => {
                    if (result.status == "error") {
                        resolve(result);
                    } else {
                        updatePro(resolve);
                    }
                });
            }
        });

        function updatePro(resolve) {
            db.del("product", `product='${args.key}'`).then(() => {
                //确保删除之后再新建
                //新建产品之前把之前的产品停掉
                stopProduct(args.key);
                that.newProLine(args).then(res => {

                    resolve({
                        status: "ok"
                    });
                });
            });
        }
    }

    /**
     * 1.检查需要创建的产品是否已经存在于数据库中
     * 2.检查需要创建的产品的src路径是否设置正确
     * @param {*产品的参数} args
     * @return {true:代表通过测试} {false:代表失误} 
     */
    isProductExist(args) {
        let that = this;
        return new Promise((resolve, reject) => {
            //首先，检查svn路径是否正确
            //然后, 检查在产品目录是否已经存在

            Promise.all([SVN.prototype.checkSrc(args.src), db.get("*", "product", `product='${args.product}'`)]).then((values) => {
                if (values[0].status == "error") {
                    resolve(values[0]);
                } else if (values[1].rows.length > 0) {
                    resolve({
                        status: "error",
                        errMessage: "产品已经存在"
                    })
                }

                resolve({
                    status: "ok"
                });

            }).catch(err => {
                reject({
                    status: "error",
                    errMessage: err
                })
            });


        });
    }

}
module.exports = new CIControl();