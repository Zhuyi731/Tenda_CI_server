/**
 * @author zhuyi
 * @desc 此文件所在层级位于服务器Controller层，用于处理逻辑。
 * @license MIT license
 * @Version V1.0.0
 * @last modify 2018.8.2
 * @title 在线编译逻辑处理
 */
const ProductManager = require("../../models/CI/productManager");

class CompileController {
    compile(name) {
        let product = ProductManager.getProduct(name);
        if (!product) {
            return Promise.reject({
                status: "error",
                errMessage: "产品未找到"
            });
        }
        return product.compile();
    }
}

const compileController = new CompileController();
module.exports = compileController;