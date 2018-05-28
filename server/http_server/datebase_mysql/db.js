var mysql = require("mysql");
var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "admin",
    database: "ciserver"
});

function query(sql, args, callback) {
    pool.getConnection(function (err, connection) {
        connection.query(sql, args, function (err, rows) {
            callback(err, rows);
            connection.release();
        });
    });
}


exports.query = query;