const ProductManager = require("../auto_test_server/productManager");

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