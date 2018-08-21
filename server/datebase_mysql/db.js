const mysql = require("mysql");
const DB_CONFIG = require("../config/mysql_config");
const pool = mysql.createPool(DB_CONFIG);

/**
 * 基础sql接口
 * @param {*sql语句} sql 
 * @param {*可选参数，用于多字段修改} args 
 */
function query(sql, args = "", recorded, times) {
    let curRetryTimes = times || 0;
    /**
     * 每次操作都将其记录在systemlog中
     */
    // if (!recorded) {
    //     //TODO:将user替换
    //     let event = sql.replace(/'/g,"''");
    //     query(`INSERT systemlog(event,messages,user) VALUES('${event}','执行sql语句','admin')`, "", true);
    // }

    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            //可能出现连接池被占用的情况，尝试重新连接
            if (err) {
                if (curRetryTimes < 3) {
                    retryQuery(err);
                } else {
                    reject({
                        status: "error",
                        errMessage: err
                    });
                }
            } else {
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
            }
        });
    });

    function retryQuery(err) {
        console.log(`尝试执行sql语句:${sql}时发生错误，错误信息:${err}`);
        curRetryTimes++;
        console.log(`正在尝试第${curRetryTimes}次重新执行sql语句`)
        setTimeout(() => {
            query(sql, args, false, curRetryTimes);
        }, 2000);
    }


}

/**
 * 查询接口   SELECT nameArr FROM from WHERE where
 * @param {*字段数组} nameArr 
 * @param {*表名} from 
 * @param {*条件} where 
 */
function get(nameArr, from, where) {
    Array.isArray(nameArr) && (nameArr = nameArr.join(","));
    let sql = `SELECT ${nameArr} from ${from}`;
    !!where && (sql = sql.concat(` WHERE ${where}`));

    return query(sql);
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
        v = "('" + values.join("','") + "')";
    }
    let sql = `INSERT ${table} ${f} VALUES ${v}`;

    return query(sql);
}

/**
 * update的fileds字段和values字段必须为数组
 * @param {*表名} table 
 * @param {*字段名} fileds @type Array  
 * @param {*数值} values  @type Array
 */
function update(table, fileds, values, where) {
    if (!Array.isArray(fileds) || !Array.isArray(values)) {
        throw new Error("update的参数必须为Array");
    }
    if (fileds.length != values.length) {
        throw new Error("fileds字段和values字段数组长度必须一致");
    }

    let sql = `UPDATE ${table} SET `,
        i;
    for (i = 0; i < fileds.length; i++) {
        !!i && (sql += ",");
        sql += `${fileds[i]}='${values[i]}'`;
    }

    if (!!where && typeof where == "string") {
        sql += " WHERE " + where;
    };

    return query(sql);
}

/**
 * 
 * @param {*表名} table 
 * @param {*要删除的条件} where 
 */
function del(table, where) {
    let sql = `DELETE FROM ${table} where ${where}`;
    return query(sql);
}

/**
 * for debug
 * 用于校验功能函数功能是否正确
 */
// get("*", "product", "product='11AC'").then((data) => {
//     console.log(data.rows);
// });

// insert("systemlog", ["event", "messages", "user"], ["INSERT", "插入操作", "zhuyi"]).then(() => {
//     console.log("插入成功");
// });

// update("systemlog", ["event","messages"], ["sss","fucku"], "event='INSERT1'").then(() => {
//     console.log("更新成功");
// });

// del("systemlog","event='sss'")


module.exports = {
    query,
    get,
    insert,
    update,
    del
};