const fs = require("fs");
const path = require("path");
const spawn = require("child_process").spawn;
const productManager = require("../auto_test_server/productManager");

class Compiler {
    constructor(name) {
        this.productName = name;
        this.product = productManager.getProduct(name);

        if (!!this.order) {
            throw new Error("该项目没有配置编译指令");
        }
    }

    compile() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.product.updateStatus(that.product)
                .then(() => {
                    that.cwd = that.product.fullPath;
                    that.order = that.product.config.compileOrder;
                    return that.installDependence();
                })
                .then(() => {
                    return that.runCompileOrder();
                })
                .then(() => {
                    resolve(that.product.config.localDist);
                })
                .catch(err => {
                    reject(err);
                    console.log(err);
                })

        });
    }

    /**
     * 运行cnpm install 来安装依赖
     */
    installDependence() {
        let that = this;
        return new Promise((resolve, reject) => {
            let sp = spawn("cnpm", ["install"], {
                shell: true,
                cwd: that.cwd
            });
            wrapSpawn(sp, resolve, reject);
        });
    }
    /**
     * 运行编译指令
     */
    runCompileOrder() {
        let that = this;
        return new Promise((resolve, reject) => {
            let sp = spawn("npm", ["run", that.order], {
                shell: true,
                cwd: that.cwd
            });
            wrapSpawn(sp, resolve, reject);
        });
    }
}

function wrapSpawn(sp, resolve, reject) {
    let text = "",
        hasError = false,
        errorText = [];
    //process error
    sp.on("err", (err) => {
        console.log("error when excute svn checkout");
        reject("进程错误");
    });

    //std error
    sp.stderr.on('data', (data) => {
        errorText.push(data.toString("utf-8"));
        hasError = true;
        console.log(data.toString("utf-8"));
    });

    //collect std stream information
    sp.stdout.on("data", (data) => {
        text += data;
        console.log(data.toString("utf-8"));
    });

    sp.stdout.on("close", () => {
        //有错误也要resolve  cnpm install时可能会有警告信息
        if (hasError) {
            resolve({
                status: "error",
                errMessage: errorText
            })
        } else {
            resolve({
                status: "ok",
                text: text
            });
        }
    });
}

module.exports = Compiler;


/**
 * DEBUG:START
 */
const Product = require("../auto_test_server/product");
let pro1 = new Product({
    product: "O3V2.0",
    productLine: "AP",
    members: ["zhuyi"],
    copyTo: ["zhuyi"],
    src: "http://192.168.100.233:18080/svn/GNEUI/SourceCodes/Trunk/GNEUIv1.0/O3v2_temp",
    dist: "",
    isOld: "1",
    schedule: "tr1",
    interval: "3",
    remarks: ""
});
productManager.push(pro1);
const compiler = new Compiler("O3V2.0");
compiler.compile();