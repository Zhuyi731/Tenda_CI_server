const path = require("path");
//引入数据库
const db = require("../../datebase_mysql/db.js");
//引入自动检测机制
const Product = require("../auto_test_server/auto_test");

!Product.products && (Product.prototype.products = []);

function CIControl() {

    this.getAllLine = () => {

        return new Promise((resolve) => {
            db.query("SELECT DISTINCT productLine FROM product", "", function (err, rows) {
                if (err) {
                    resolve({
                        message: "datebase error"
                    });
                } else {
                    rows = rows.map((val) => {
                        return val.productLine
                    });
                    resolve({
                        "productLines": rows
                    });
                }
            });
        });

    };

    /**
     * @param{args} 插入数据库的参数
     * 新建一个项目之后，立即放入检测队列中
     */
    this.newProLine = (args) => {

        return new Promise((resolve) => {
            let insertSQL = "INSERT into product(products,productLine,isOld,startTime,src,dist,schedule,`interval`,remarks) values(?,?,?,?,?,?,?,?,?)"
            let insertArgs = [args.product, args.productLine, parseInt(args.isOld), parseInt(args.startTime), args.src, args.dist, args.schedule, parseInt(args.interval), args.remarks];

            //插入新项目之后便要开启项目的检查
            db.query(insertSQL, insertArgs, function (err, rows) {
                if (err) {
                    resolve({
                        message: "datebase error"
                    });
                } else {
                    let pro = new Product(args);
                    Product.products.push(pro);
                    pro.start();
                    
                    resolve({
                        status: "ok"
                    });
                }
            });

        });
    };

    this.getAllProducts = () => {
        return new Promise((resolve) => {
            db.query("SELECT * FROM product", function (err, rows) {
                if (err) {
                    resolve({
                        message: "datebase error"
                    });
                } else {
                    console.log(rows);
                    resolve({
                        "products": rows
                    });
                }
            })
        })
    };

}

module.exports = new CIControl();