const fs = require("fs");
const path = require("path");
const util = require("../../util/util");
const Product = require("./product");
const db = require("../../../datebase_mysql/db");
const localPath = require("../../../config/basic_config").svnConfig.root;


class ProductManager {
    constructor() {
        this.products = [];
    }

    push(pro) {
        this.products.push(pro);
    }

    /**
     * 通过name查询
     * 返回对应product实例的下标
     * @param {*产品名称} name
     * @return {} product实例的下标
     */
    getProduct(name) {
        return this.products[this.getIndex(name)];
    }

    getIndex(name) {
        let ret = -1;
        this.products.forEach((pro, index) => {
            if (pro.name == name) {
                ret = index;
                return;
            }
        })
        return ret;
    }

    /**
     * 删除项目
     * 1.删除其在本地路径中的代码
     * 2.删除在数据库中的记录
     */
    deleteProduct(name) {
        let product = this.getProduct(name),
            index = this.getIndex(name),
            that = this;
        return new Promise((resolve, reject) => {
            if (index == -1) {
                reject({
                    status: "error",
                    errMessage: `${name}没有记录在productManager中`
                })
            } else {
                db.del("product", `product='${product.name}'`)
                    .then(() => {
                        //删除文件夹
                        return that.removeProjectDirectory(name);
                    }).then(() => {
                        that.products.splice(index, 1);
                        resolve({
                            status: "ok",
                            message: "删除成功"
                        });
                    }).catch(err => {
                        reject({
                            status: "error",
                            errMessage: err
                        })
                    });
            }
        });
    }

    /**
     * 检查在产品中，但是没有在数据库中的情况，删除这个产品
     */
    checkProductInDB(that) {
        return new Promise((resolve, reject) => {
            /**
             * 让每个产品去检查自身状态即可，
             * 若检查出有不在数据库中的情况则自己会删除
             * 在product.updateStatus中
             */
            let seqArr = [];
            that.products.forEach(el => {
                seqArr.push(() => {
                    return db.get("*", "product", `product='${el.name}'`)
                });
                seqArr.push((data) => {
                    if (data.rows.length == 0) {
                        return that.deleteProduct(el.name);
                    } else {
                        return;
                    }
                })
            });
            runSequence(seqArr, that)
                .then(() => {
                    resolve(that)
                })
                .catch(err => {
                    console.log(err);
                    reject({
                        status: "error",
                        errMessage: err
                    });
                });
            /**
             * 使promise顺序运行
             * @param {*要顺序运行的promise数组} funcs 
             */
            function runSequence(runners, that) {
                let result = Promise.resolve();
                runners.forEach(runner => {
                    result = result.then(runner);
                })
                return result;
            }
        });
    }

    /**
     * 检查在数据库中添加了新的产品
     * 但是没有被productManager记录的情况
     */
    checkDBInProduct(that) {
        return new Promise((resolve, reject) => {
            Promise.all([db.get("*", "product"),
                    db.get("*", "productmember"),
                    db.get("*", "productcopyto")
                ])
                .then((values) => {
                    let productsInDB = values[0].rows;
                    productsInDB.forEach(product => {
                        //更新member、copyto状态
                        updateCopyToMember(product, values[1].rows, values[2].rows);
                        //说明没有找到在Product中有实例 则生成一个实例
                        if (that.getIndex(product.product) == -1) {
                            let tpProduct = new Product(product);
                            that.products.push(tpProduct);
                        }
                    });
                    return;
                })
                .then(() => {
                    resolve(that)
                }).catch(err => {
                    console.log(err)
                });

            function updateCopyToMember(product, member, copyTo) {
                product.copyTo = [];
                product.member = [];
                member.forEach(el => {
                    if (el.product == product.product) {
                        product.member.push(el.member);
                    }
                });
                copyTo.forEach(el => {
                    if (el.product == product.product) {
                        product.copyTo.push(el.copyTo);
                    }
                });
            }

        });
    }

    /**
     * 递归删除文件夹
     * @param {*文件夹路径} dir 
     */
    removeProjectDirectory(name) {
        return new Promise((resolve, reject) => {
            util.rmdirSync(path.join(localPath, name), (e) => {
                if (e) {
                    reject({
                        status: "error",
                        errMessage: e
                    });
                } else {
                    resolve({
                        status: "ok",
                        message: "删除成功"
                    });
                }
            })


        });
    }

    runProductOnRunning(that) {
        function promiseFactory(pro) {
            return function () {
                return new Promise((resolve, reject) => {
                    pro.runTest()
                        .then(() => {
                            resolve();
                        })
                        .catch(err => {
                            reject(err)
                        });
                });
            }
        }

        let result = Promise.resolve();

        that.products.forEach(product => {
            result = result.then(promiseFactory(product));
        });
    }

}


let productManager = new ProductManager();

// //DEBUG:START
// let pro1 = new Product({
//     product: "O3V2.0",
//     productLine: "AP",
//     members: ["zhuyi"],
//     copyTo: ["zhuyi"],
//     src: "http://192.168.100.233:18080/svn/GNEUI/SourceCodes/Trunk/GNEUIv1.0/O3v2_temp",
//     dist: "",
//     schedule: "tr1",
//     interval: "3",
//     remarks: ""
// });
// let pro2 = new Product({
//     product: "O4V2.0",
//     productLine: "AP",
//     members: ["zhuyi"],
//     copyTo: ["zhuyi"],
//     src: "http://192.168.100.233:18080/svn/GNEUI/SourceCodes/Trunk/GNEUIv1.0/O3v2_temp",
//     dist: "",
//     schedule: "tr1",
//     interval: "3",
//     remarks: ""
// });

// productManager.products = [pro1, pro2];

// //DEBUG:END
module.exports = productManager;