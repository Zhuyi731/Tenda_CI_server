const SVN = require("../../svn_server/svn");
const Mailer = require("../../mail_server/mail");

const fs = require("fs");
const path = require("path");
global.debug = true;
const {
    spawn
} = require("child_process");

//svn 配置
const {
    svnConfig
} = require("../../config/basic_config");



class Product {

    constructor(config) {
        /**
         * @prop config 传入的项目配置项
         *       {
         *          product:产品名
         *          members:项目成员   @type array 
         *          productLine:产品线
         *          isOld:是否为老代码
         *          startTime:项目开始时间
         *          src:项目的svn  src路径
         *          dist:dist路径
         *          schedule:项目当前阶段
         *          interval:项目检测间隔(单位h)需要转换为ms
         *          status:项目当前运行状态   @options {*正在运行检测中} running @options {*已经停止检测} closed
         *          remarks:项目备注
         *       }
         * @prop tiemr  定时器
         * @prop lastCheckTime 上一次执行检查的时间
         * @prop fullPath      本地储存的完整路径
         * @prop debug         是否开启调试模式
         * 
         * @prop svn           SVN实例，用于调用svn操作
         * @prop mailer        Node-Mailer实例 用于调用邮箱操作
         */
        this.config = config;
        this.config.interval = parseInt(this.config.interval) * 60 * 60 * 1000;

        //检测定时器
        this.timer = null;

        //上一次检查的时间  @format : time stamp
        this.lastCheckTime = 0;
        this.fullPath = svnConfig.root + "\\" + this.config.product;
        this.debug = global.debug;

        //生成项目对应的svn实例
        this.svn = new SVN(svnConfig, {
            path: this.config.src,
            localPath: this.fullPath,
            name: this.name,
            debug: global.debug
        });

        //生成项目对应的邮件发送器实例
        this.mailer = new Mailer();
    }

    /*
     *检查svn上是否有更新代码
     *@return 有则返回true   没有则返回false
     */
    hasUpdate() {
        return new Promise((resolve, reject) => {
            let that = this;
            //通过最近一条svn log的时间与上次检查的时间做比较，来判断是否有更新
            this.svn.log()
                .then(function (data) {
                    let time = data.toString("utf-8").split("|")[2].split("(")[0];
                    //获取时间戳
                    time = new Date(time).getTime();
                    //如果在上次检查后更新了代码，则返回true
                    resolve(time > that.lastCheckTime);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    /**
     * 第一次启动测试
     * 1.首先从svn上checkout对应的代码
     * 2.然后生成配置文件
     * 3.然后进行测试
     */
    start() {
        let that = this;
        //将于当时立即开启检测
        //TODO: 可以调整到晚上24点之后再检测
        this.svn.checkout().then(() => {
                that.initialFile().then(() => {
                    that.runTest()
                });
            })
            .catch(err => {
                console.log(err)
            });

        //TODO: 首先要检查在数据库中的情况
    }

    /**
     * 检查
     * 1.首先检查在检查期间内是否有更新代码
     * 2.然后调用r-check来检查
     * 3.查看errlog是否有错误信息
     * 4.有错误信息则通过node-mailer来通知给对应的人员
     */
    runTest() {
        let that = this;
        that.hasUpdate().then((isUpdated) => {
            that.timer = setTimeout(() => {
                that.runTest();
            }, that.config.interval);

            //没有代码更新则返回
            if (!isUpdated) return;

            //更新检查时间
            that.lastCheckTime = new Date().getTime();
            that.checkCode().then((res) => {
                if (res.hasError) {
                    that.sendErrorMail(res.text);
                }
            });

        }).catch(err => {
            console.log(err)
        });

    }

    /**
     * 生成配置文件
     * 通过调用r-check init -y -o 指令来生成
     */
    initialFile() {
        let that = this;
        return new Promise(function (resolve, reject) {
            let text = "",
                spawnArgs = ["init", "-y"],
                sp;

            //如果是老代码则加入老代码选项
            that.config.isOld == "1" && spawnArgs.push("-o");

            //执行r-check init -y -o
            sp = spawn("r-check", spawnArgs, {
                cwd: that.fullPath,
                //windows下必须有shell属性 ， 因为r-check生成的命令行是.cmd格式的    但是svn命令是不需要的
                shell: true
            });

            wrapSpawn(that, sp, resolve, reject);

        });

    }

    /**
     * 检查代码规范和编码格式
     * @order 通过 r-check run -Q 来检查代码规范和编码格式
     * @param {*检查出来的错误信息} errorText
     */
    checkCode(errorText) {
        let that = this;

        return new Promise((resolve, reject) => {
            let spawnArgs = ["run", "-Q"],
                sp = spawn("r-check", spawnArgs, {
                    cwd: that.fullPath,
                    shell: true
                });

            wrapSpawn(that, sp, resolve, reject);

        });

    }

    //发现错误时，给对应的项目成员发送邮件
    sendErrorMail(errorMessage) {
        let that = this,
            subject = `CI自动检测报告(项目:${this.config.product})`,
            //根据错误信息  生成邮件模板
            res = creatMessageTemplate();

        let mailOptions;

        this.mailer.sendFailMail(this.config.members, this.config.copyTo, subject, res.body, res.attach);

        function creatMessageTemplate() {
            let mes = "",
                other = "并且检查到如下JS规则错误过多:\n",
                tail = "",
                hasOther = false,
                body = "请不要回复此邮件!\n\n" + `         检测项目:${that.config.product}\n错误日志：\n`,
                errorNum = {
                    map: {
                        H: "html",
                        C: "css",
                        J: "js",
                        E: "encode"
                    }
                },
                attach = [];

                /**
                 * 遍历生成正文
                 */
            errorMessage.forEach(function (err) {
                if (/\*\*\*/.test(err)) {
                    other += "\t\t" + err.split("JS检查")[1].split("*")[0] + "\n";
                    hasOther = true;
                } else {
                    if (err[0] == "J") {
                        let tmpMes = /发现(.*)个警告/g.exec(err);
                        if (tmpMes && tmpMes.length > 1) {
                            errorNum.jsWarn = tmpMes[1];
                        }
                        tmpMes = /发现(.*)个错误/g.exec(err);
                        if (tmpMes && tmpMes.length > 1) {
                            errorNum.js = tmpMes[1];
                        }
                    } else if (err[0] == "E") {
                        tail += "\n" + err + "\n";
                    } else {
                        errorNum[errorNum.map[err[0]]] = /发现(.*)个错误/g.exec(err)[1];
                    }
                }
            }, this);

            body += `\t\t        HTML错误:${errorNum.html}\n\n` +
                `\t\t          CSS错误:${errorNum.css}\n\n` +
                `\t\t          JS错误:${errorNum.js}\n\n`;
            hasOther && (body += other);
            body += tail;

            //写入附件信息
            attach = pushAttachments(errorNum);

            return {
                body,
                attach
            };
        }

        function pushAttachments(errorNum) {
            let att = [];
            ["html", "css", "js"].forEach((type) => {
                if (errorNum[type] != "0" && fs.existsSync(path.join(that.fullPath, `./errorLog/${type}/errorLog.txt`))) {
                    att.push({
                        filename: `${type}_error_log.txt`,
                        path: path.join(that.fullPath, `./errorLog/${type}/errorLog.txt`)
                    });
                }
            });
            return att;
        }

    }

    stop() {
        this.lastCheckTime = 0;
        !!this.timer && clearTimeout(this.timer);
        this.timer = null;
    }

}

/**
 * 
 * @param {*上下文} that 
 * @param {*spawn实例} sp 
 * @param {*你猜} resolve 
 * @param {*你猜} reject 
 * @return {*返回输出的标准输出流信息。}
 */
function wrapSpawn(that, sp, resolve, reject) {
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
    });

    //collect std stream information
    sp.stdout.on("data", (data) => {
        text += data;
    });

    sp.stdout.on("close", () => {
        !!that.debug && console.log(text, errorText);

        resolve({
            text: hasError ? errorText : text,
            hasError: hasError
        });
    });
}


/**debug */
!Product.products && (Product.prototype.products = []);

let pro = new Product({
    product: "03V2.0",
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


pro.start();

module.exports = Product;