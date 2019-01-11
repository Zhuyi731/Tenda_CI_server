const path = require("path");

class BasicConfig {
    constructor() {
        this.httpConfig = {
            //监听端口
            port: 80
        };

        /**
         * 检查的时间
         * 21代表晚上9点 这样子
         * timeToclearoem代表清除oem定制路径下的所有项目的时间
         */
        this.ciConfig = {
            CHECK_TIME: 7, //检查的时间段  24小时制
            TIME_TO_CLEAR_OEM: 23, //清除OEM储存的文件夹的时间
            ERROR_REPORT_FILENAME: "Error_Report.html" //CI错误报告邮件的附件名
        };

        /**
         * 管理员
         * 每次出现错误时都会向管理员copy邮件
         * TODO:放到数据库里刻
         */
        this.managers = ["zhuyi"];

        this.svnConfig = {
            //SVN用户名
            user: "Pengjuanli",
            //SVN密码
            pass: "123321",
            //服务器上储存的根目录
            root: path.join(__dirname, "../../CI_storage"),
            //10s没收到回复则认为超时
            svnTimeout: 10000,
            //svn做的哪些操作需要console出来信息
            typeToConsole: new Map([
                ["up", "up"],
                ["init", "init"],
                ["export", "export"]
            ])
        };

        this.oemConfig = {
            root: path.join(__dirname, "../../OEM_storage")
        };
    }
}
module.exports = new BasicConfig();