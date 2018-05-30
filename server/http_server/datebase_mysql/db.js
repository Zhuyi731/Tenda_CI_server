var mysql = require("mysql");
var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "admin",
    database: "ciserver"
});

function query(sql, args) {
    return new Promise((resolve) => {
        pool.getConnection(function (err, connection) {
            connection.query(sql, args, function (err, rows) {
                resolve({
                    err,
                    rows
                });
                connection.release();
            });
        });
    });

}

query("SELECT product.productLine,users.mail,users.name  FROM product,users", "").then(({err, rows}) => {
    console.log(rows);
})


exports.query = query;