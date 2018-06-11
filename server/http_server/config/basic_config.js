class BasicConfig {
    constructor() {
        this.http_config = {
            port: 3000
        };

        //administrator账户
        this.admin = {
            user: "admin",
            pass: "admin"
        };
        /**
         * 检查的时间
         * 21代表晚上9点 这样子
         */
        this.checkTime = "21";
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
            root: "E:\\CITEST",
            //10s没收到回复则认为超时
            svnTimeout: 10000,
            //svn做的那些操作需要console出来信息
            typeToConsole: new Map([
                ["up", "up"],
                ["init", "init"],
                ["log", "log"]
            ])
        };
    }
}
module.exports = new BasicConfig();