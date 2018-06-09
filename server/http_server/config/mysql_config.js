const MYSQL_CONFIG = {
    host: "localhost",
    user: "root",
    password: "admin",
    database: "ciserver",
    port: 3306,
    //最大连接个数
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
    aquireTimeout: 60 * 60 * 1000
}

module.exports = MYSQL_CONFIG;