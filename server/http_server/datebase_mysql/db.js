const mysql = require("mysql");
const DB_CONFIG = require("../config/mysql_config");
var pool = mysql.createPool(DB_CONFIG);

function query(sql, args = "") {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if(err) resolve({status:"error",errMessage:err});
            connection.query(sql, args, function (err, rows) {
                if (err) {
                    reject({
                        status: "error",
                        errMessage: err
                    })
                } else {
                    resolve({
                        err,
                        rows
                    });
                }
                connection.release();
            });
        });
    });

}

//查询操作
function get(nameArr, from, where) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                setTimeout(() => {
                    get(nameArr, from, where);
                }, 1000);
            };
            let arrs = nameArr,
                sql;
            Array.isArray(nameArr) && (arrs = arrs.join(","));
            sql = `SELECT ${arrs} from ${from}`;
            !!where && (sql = sql.concat(` where ${where}`));

            connection.query(sql, function (err, rows) {
                resolve({
                    err,
                    rows
                });
                connection.release();
            });
        });
    });
}

/**
 * 
 * @param {*表名} table 
 * @param {*字段数组} fields 
 * @param {*数值数组} values 
 */
function insert(table, fields = "", values) {
    let f, v;
    //输入可以为string或者array
    //string 格式 :  "(a,b,c)"
    //array 格式: ["a","b","c"]
    if (fields == "") {
        f = "";
    } else if (typeof fields == "string") {
        f = fields;
    } else if (Array.isArray(fields)) {
        f = "(" + fields.join(",") + ")";
    }

    if (typeof values == "string") {
        v = values;
    } else if (Array.isArray(values)) {
        v = "(" + values.join(",") + ")";
    }

    return new Promise((resolve) => {
        pool.getConnection(function (err, connection) {
            let sql = `INSERT ${table}${f} values${v}`;

            connection.query(sql, function (err, rows) {
                resolve({
                    err,
                    rows
                });
                connection.release();
            });
        });
    });
}

/**
 * update的fileds字段和values字段必须为数组
 * @param {*表名} table 
 * @param {*字段名} fileds @type Array  
 * @param {*数值} values  @type Array
 */
function update(table, fileds, values, where) {
    if (!Array.isArray(fileds) || !Array.isArray(fileds)) {
        throw new Error("update的参数必须为Array");
    }
    if (fileds.length != values.length) {
        throw new Error("fileds字段和values字段数组长度必须一致");
    }
    let sql = `UPDATE ${table} SET `,
        i;
    for (i = 0; i < fileds.length; i++) {
        sql += `${fileds[i]}=${values[i]}`;
        !!i && (sql += ",");
    }

    if (!!where && typeof where == "string") {
        sql += " WHERE " + where;
    };

    return new Promise((resolve) => {
        pool.getConnection(function (err, connection) {
            connection.query(sql, function (err, rows) {
                resolve({
                    err,
                    rows
                });
                connection.release();
            });
        });
    });

}

/**
 * 
 * @param {*表名} table 
 * @param {*要删除的条件} where 
 */
function del(table, where) {
    let sql = `DELETE FROM ${table} where ${where}`;

    return new Promise((resolve) => {
        pool.getConnection(function (err, connection) {
            connection.query(sql, function (err, rows) {
                resolve({
                    err,
                    rows
                });
                connection.release();
            });
        });
    });
}

module.exports = {
    query,
    get,
    insert,
    update,
    del
}