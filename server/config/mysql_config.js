const MYSQL_CONFIG = {
    //数据库ip
    host: "localhost",
    //账户名
    user: "root",
    //密码
    password: "admin",
    //数据库名
    database: "ciserver",
    //数据库端口
    port: 3306,
    //最大连接个数
    connectionLimit: 1000,
    //连接池超时时间
    connectTimeout: 60 * 60 * 1000,
    //连接超时时间
    timeout: 60 * 60 * 1000,
    //请求超时时间
    aquireTimeout: 60 * 60 * 1000
}

module.exports = MYSQL_CONFIG;