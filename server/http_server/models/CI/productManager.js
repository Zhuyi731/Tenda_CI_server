const path = require("path");
const fo = require("../../util/fileOperation");
const Product = require("./product");
const localPath = require("../../../config/basic_config").svnConfig.root;
const dbModel = require("../../../datebase_mysql/dbModel");

class ProductManager {
    constructor() {
        this.products = [];
        //bind this
        this.doubleCheck = this.doubleCheck.bind(this);
        this.deleteProduct = this.deleteProduct.bind(this);
        this.runProductOnRunning = this.runProductOnRunning.bind(this);
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
        return this.products.find(el => el.name == name);
    }

    getIndex(name) {
        return this.products.findIndex(el => el.name == name);
    }

    /**
     * 删除项目
     * 1.删除其在本地路径中的代码
     * 2.删除在数据库中的记录
     */
    deleteProduct(name) {
        let product = this.getProduct(name),
            index = this.getIndex(name);

        return new Promise((resolve, reject) => {
            fo.rmdirSync(path.join(localPath, name));
            index != -1 && this.products.splice(index, 1);

            dbModel.tableModels.Product
                .destroy({
                    where: {
                        product: {
                            "$eq": `${product.name}`
                        }
                    }
                })
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * 检查在产品中，但是没有在数据库中的情况，删除这个产品
     */
    checkProductInDB() {
        return new Promise((resolve, reject) => {
            /**
             * 让每个产品去检查自身状态即可，
             * 若检查出有不在数据库中的情况则自己会删除
             * 在product.updateStatus中
             */
            let seqArr = [];
            this.products.forEach(el => {
                seqArr.push(() => {
                    return dbModel.tableModels.Product.findOne({
                        where: {
                            product: {
                                "$eq": `${el.name}`
                            }
                        }
                    });
                });
                seqArr.push(data => {
                    return !!data ? undefined : this.deleteProduct(el.name);
                });
            });

            runSequence(seqArr, resolve, reject)
                .then()
                .catch();
            /**
             * 使promise顺序运行
             * @param {*要顺序运行的promise数组} funcs 
             */
            function runSequence(runners, resolve, reject) {
                let result = Promise.resolve();
                runners.forEach(runner => {
                    result = result.then(runner);
                });
                result = result.then(resolve).catch(reject);
                return result;
            }
        });
    }

    /**
     * 检查在数据库中添加了新的产品
     * 但是没有被productManager记录的情况
     * 
     * 检查在productManager中但是没有在数据库中的情况
     */
    doubleCheck() {
        return new Promise((resolve, reject) => {
            dbModel.tableModels.Product
                .findAll({
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
                .then(allProductsInDB => {
                    //productManager中的产品是否都在数据库中
                    this.products.forEach(productInManager => {
                        if (!allProductsInDB.find(el => el.product == productInManager.name)) {
                            this.deleteProduct(productInManager.name);
                        }
                    });
                    //检查数据库中的是否在产品中都已经有了检查
                    allProductsInDB.forEach(productInDB => {
                        productInDB = productInDB.dataValues;
                        if (!this.getProduct(productInDB.product)) {
                            productInDB.copyTo = productInDB.copyTo.map(el => el.copyTo);
                            productInDB.member = productInDB.member.map(el => el.member);
                            this.products.push(new Product(productInDB));
                        }
                    });
                    resolve();
                })
                .catch(reject);
        });
    }

    runProductOnRunning() {
        function promiseFactory(pro) {
            return function() {
                return new Promise((resolve, reject) => {
                    pro.runTest()
                        .then(resolve)
                        .catch(reject);
                });
            }
        }

        let result = Promise.resolve();

        this.products.forEach(product => {
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