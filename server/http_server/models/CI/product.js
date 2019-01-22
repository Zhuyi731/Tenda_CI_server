const fs = require("fs");
const path = require("path");
const util = require("../../util/util");
const archiver = require('archiver');
const SVN = require("../../../svn_server/svn");
const Mailer = require("../../../mail_server/mail");
const dbModel = require("../../../datebase_mysql/dbModel");
const spawn = require("child_process").spawn;
const basicConfig = require("../../../config/basic_config");
const svnConfig = basicConfig.svnConfig;

class Product {
    constructor(config) {
        /**
         * @prop config 传入的项目配置项
         *       {
         *          @prop product:产品名
         *          @prop member:项目成员   @type array 
         *          @prop copyTo:当项目出错时，应该发送的对象 @type array 
         *          @prop productLine:产品线
         *          @prop startTime:项目开始时间
         *          @prop src:项目的svn  src路径
         *          @prop dist:dist路径
         *          @prop schedule:项目当前阶段
         *          @prop interval:项目检测间隔(单位h)需要转换为ms
         *          @prop status:项目当前运行状态   @options {*正在运行检测中} running @options {*已经停止检测} pending
         *       }
         * @prop tiemr  定时器
         * @prop lastCheckTime 上一次执行检查的时间
         * @prop fullPath      本地储存的完整路径
         * @prop debug         是否开启调试模式
         * 
         * 
         * @prop svn           SVN实例，用于调用svn操作
         * @prop mailer        Node-Mailer实例 用于调用邮箱操作
         */
        this.config = config;
        this.fullPath = svnConfig.root + "\\" + this.config.product;
        //检查在路径下是否已经有文件了，有文件则认为已经通过svn co下拉过代码了
        this.checkouted = false;
        //检查在路径下是否存在node_modules文件夹 如果存在则认为已经安装过相关依赖了。
        this.installed = (fs.existsSync(path.join(this.fullPath, "./node_modules")) && fs.readdirSync(path.join(this.fullPath, "./node_modules")).length > 0);
        //上一次检查的时间  @format : time stamp 第一次初始化时为0
        this.lastCheckTime = 0;
        this.debug = global.debug.product;
        this.name = this.config.product;

        //生成项目对应的svn实例
        this.svn = new SVN({
            path: this.config.src,
            localPath: this.fullPath,
            name: this.name,
            debug: global.debug.product
        });
        //生成项目对应的邮件发送器实例
        this.mailer = new Mailer();

        //bind this
        this.init = this.init.bind(this);
        this.compile = this.compile.bind(this);
        this.runTest = this.runTest.bind(this);
        this.hasUpdate = this.hasUpdate.bind(this);
        this.checkCode = this.checkCode.bind(this);
        this.initialFile = this.initialFile.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this._packCompiled = this._packCompiled.bind(this);
        this._runCompileOrder = this._runCompileOrder.bind(this);
        this._installDependencies = this._installDependencies.bind(this);
    }

    /*
     *检查svn上是否有更新代码
     *@return 有则返回true   没有则返回false
     */
    hasUpdate() {
        return new Promise((resolve, reject) => {
            //通过最近一条svn log的时间与上次检查的时间做比较，来判断是否有更新
            this.svn
                .log()
                .then(data => {
                    let time = data.text.toString("utf-8").split("|")[2].split("(")[0];
                    //获取时间戳
                    time = new Date(time).getTime();
                    //如果在上次检查后更新了代码，则返回true
                    resolve(time > this.lastCheckTime);
                })
                .catch(reject);
        });
    }

    /**
     * 第一次启动测试
     * 1.首先从svn上checkout对应的代码
     * 2.然后生成配置文件
     * 3.然后进行测试
     * start和run的区别在于start会下拉代码
     */
    init() {
        return new Promise((resolve, reject) => {
            if (this.checkouted) {
                resolve(this);
            } else {
                this.svn
                    .checkout()
                    .then(this.initialFile)
                    .then(() => {
                        //多国语言并上传了excel
                        if (this.config.isMultiLang == "1" && this.config.excelUploaded == "1") {
                            return this._modifyRconfig();
                        } else {
                            return;
                        }
                    })
                    .then(resolve)
                    .catch(reject);
            }
        });

    }

    /**
     * 更新自身状态
     * 包括
     * 1.更新在数据库中的状态
     * 2.更新在本地路径中的代码
     */
    updateStatus() {
        return new Promise((resolve, reject) => {
            /**
             * 更新自身状态和代码
             */
            Promise
                .all([
                    dbModel.tableModels.Product.findOne({
                        where: {
                            product: {
                                "$eq": `${this.config.product}`
                            }
                        },
                        include: [{
                            model: dbModel.tableModels.ProductCopyTo,
                            as: "copyTo",
                            attributes: ["copyTo"]
                        }, {
                            model: dbModel.tableModels.ProductMember,
                            as: "member",
                            attributes: ["member"]
                        }]
                    }),
                    this.svn.updateCode()
                ])
                .then((values) => {
                    if (!values[0]) {
                        resolve();
                    } else {
                        let config = values[0].dataValues;
                        config.copyTo = config.copyTo.map(el => el.copyTo);
                        config.member = config.member.map(el => el.member);

                        this.config = config;
                        this.fullPath = svnConfig.root + "\\" + this.config.product;
                        this.name = this.config.product;
                        this.checkouted = (fs.existsSync(this.fullPath) && fs.readdirSync(this.fullPath).length > 0);

                        resolve();
                    }
                })
                .catch(reject);
        });
    }

    /**
     * 检查
     * 1.首先检查在检查期间内是否有更新代码
     * 2.然后调用r-check来检查
     * 3.查看errlog是否有错误信息
     * 4.有错误信息则通过node-mailer来通知给对应的人员
     */
    runTest() {
        return new Promise((resolve, reject) => {
            this.init()
                //每次检查之前要去数据库里更新当前项目的状态
                .then(this.updateStatus)
                .then(this.hasUpdate)
                .then(isUpdated => {
                    let curTime = new Date().getTime();
                    //没有代码更新则返回
                    //已经停止了，则不检查
                    if (!isUpdated || this.config.status == "pending" || curTime - this.lastCheckTime < this.config.interval * 24 * 60 * 60 * 1000 - 60 * 60 * 1000) {
                        if (!isUpdated) {
                            this.mailer.sendMail({
                                to: this.config.member,
                                copyTo: this.config.copyTo,
                                subject: "CI自动检测",
                                message: `当前项目:${this.config.product}\n项目src:${this.config.src}\n当前项目没有代码更新`
                            });
                        }
                        return {
                            noUpdate: true
                        };
                    } else {
                        //更新检查时间
                        this.lastCheckTime = curTime;
                        return this.checkCode();
                    }
                })
                .then(res => {
                    if (res && !res.noUpdate) {
                        return this._sendErrorMail();
                    } else {
                        return "";
                    }
                })
                .then(resolve)
                .catch(err => {
                    console.log("Runtest Error Report");
                    console.log(err);
                    reject(err);
                });
        });

    }

    /**
     * 生成配置文件
     * 通过调用r-check init -y -o 指令来生成
     */
    initialFile() {
        return new Promise((resolve, reject) => {
            let spawnArgs = ["init", "-y", "-f"],
                sp;

            //如果是老代码则加入老代码选项
            this.config.compiler != "none" && spawnArgs.push("-o");
            //执行r-check init -y -o
            sp = spawn("r-check", spawnArgs, {
                cwd: this.fullPath,
                shell: true
            });
            util.wrapSpawn(sp, resolve, reject, { silent: !global.debug.shouldLogWhenCheck });
        });

    }

    /**
     * 检查代码规范和编码格式
     * @order 通过 r-check run -Q 来检查代码规范和编码格式
     */
    checkCode() {
        return new Promise((resolve, reject) => {
            let spawnArgs = ["run", "-Q"],
                sp;

            if (this.config.isMultiLang == "1" && this.config.excelUploaded == "1") {
                spawnArgs.push("-T");
            }

            sp = spawn("r-check", spawnArgs, {
                cwd: this.fullPath,
                shell: true
            });

            util.wrapSpawn(sp, resolve, reject, { silent: !global.debug.shouldLogWhenCheck });
        });
    }

    /**
     * 如果是多国语言项目，则需要修改r.config.js中的语言包路径
     */
    _modifyRconfig() {
        try {
            let rconfig = fs.readFileSync(path.join(this.fullPath, "r.config.js"), "utf-8");
            rconfig = rconfig.replace(/\"jsonPath\": \"\.\/app\/common\/lang\"/g, `"jsonPath": "${this.config.langPath}"`);
            fs.writeFileSync(path.join(this.fullPath, "r.config.js"), rconfig, "utf-8");
        } catch (e) {
            throw new Error("修改r.config.js时出错");
        }
    }

    //发现错误时，给对应的项目成员发送邮件
    _sendErrorMail() {
        return new Promise((resolve, reject) => {
            let errorLogFile = path.join(this.fullPath, basicConfig.ciConfig.ERROR_REPORT_FILENAME),
                subject = `CI自动检测报告(项目:${this.config.product})`,
                //根据错误信息  生成邮件模板
                mailBody = _creatMailBody.call(this),
                attach = [{
                    filename: "Error_Report_CI.html",
                    path: errorLogFile
                }];

            this.mailer
                .sendMail({
                    to: this.config.member,
                    copyTo: this.config.copyTo,
                    subject,
                    message: mailBody,
                    attachments: attach
                })
                .then(resolve)
                .catch(reject);

            function _creatMailBody() {
                let errorLogContent = fs.readFileSync(errorLogFile, "utf-8"),
                    errorMessage = /\/\*replace-data\|(.*)\|replace-data\*\//.exec(errorLogContent)[1].split("编码规范检查:")[1],
                    errorMes = {
                        htmlErrors: /HTML\s*:\s*(.*?)\s*Problems;/.exec(errorMessage)[1],
                        cssErrors: /CSS\s*:\s*(.*?)\s*Problems;/.exec(errorMessage)[1],
                        jsErrors: /JS\s*:\s*(.*?)\s*Problems;/.exec(errorMessage)[1],
                        transCheck: /翻译检查\s*:\s*(.*?);/.exec(errorMessage)[1],
                        encodeCheck: /编码检查\s*:\s*(.*?)\s*Problems;/.exec(errorMessage)[1]
                    };

                errorLogContent = errorLogContent.replace(/<!--r-productName-->/, this.config.product);
                fs.writeFileSync(errorLogFile, errorLogContent, "utf-8");

                return `请不要回复此邮件!     
                    检测项目:${this.config.product}
                    项目src路径:${this.config.src}
    
                检测出错误如下:
                编码规范检查:
                ${errorMessage.split(";").join(";\r\n                ")}
                `;
            }
        });

    }

    /**
     * 编译操作
     */
    compile() {
        return new Promise((resolve, reject) => {
            //首先需要检查这个项目的代码是否已经从SVN下拉到本地上了
            //更新项目状态

            Promise
                .resolve()
                .then(() => {
                    if (this.checkouted) {
                        return;
                    } else {
                        return this.svn.checkout();
                    }
                })
                .then(() => {
                    return this.updateStatus();
                })
                .then(() => {
                    let error = checkConfig(this);
                    if (!!error) throw new Error(error);
                    return this._installDependencies();
                })
                .then(() => {
                    return this._runCompileOrder();
                })
                .then(() => {
                    return this._packCompiled();
                })
                .then((zipPath) => {
                    resolve(zipPath);
                })
                .catch(err => {
                    if (err.message) {
                        err = err.message;
                    }
                    reject(err);
                    console.log(err);
                });

            function checkConfig(that) {
                if (!fs.existsSync(path.join(that.fullPath, "package.json"))) {
                    return "该项目路径下没有package.json文件";
                }
                let scripts = require(path.join(that.fullPath, "package.json")).scripts;
                if (typeof scripts[that.config.compileOrder] == "undefined") {
                    return "该项目的编译指令配置不正确";
                }
                return;
            }
        });
    }


    /**
     * 运行cnpm install 来安装依赖
     */
    _installDependencies() {
        return new Promise((resolve, reject) => {
            if (this.installed) {
                resolve();
            } else {
                let sp = spawn("cnpm", ["install"], {
                    shell: true,
                    cwd: this.fullPath
                });
                util.wrapSpawn(sp, resolve, reject);
            }
        });
    }

    /**
     * 运行编译指令
     */
    _runCompileOrder() {
        return new Promise((resolve, reject) => {
            let sp = spawn("npm", ["run", this.config.compileOrder], {
                shell: true,
                cwd: this.fullPath
            });
            util.wrapSpawn(sp, resolve, reject);
        });
    }

    _packCompiled() {
        let output = fs.createWriteStream(path.join(this.fullPath, `${this.config.product}.zip`)),
            archive = archiver("zip"),
            hasError = false;

        return new Promise((resolve, reject) => {
            archive.on("error", err => {
                console.log(err);
                hasError = true;
                reject(err);
            });

            archive.on("warning", err => {
                console.log(err);
                hasError = true;
                reject(err);
            });

            archive.pipe(output);
            archive.directory(path.join(this.fullPath, this.config.localDist), false);
            archive.finalize();

            output.on('close', function() {
                console.log(archive.pointer() + ' total bytes');
                !hasError && resolve(path.join(this.fullPath, `./${this.config.product}.zip`));
                console.log('archiver has been finalized and the output file descriptor has closed.');
            });
        });


    }
}

/**DEBUG:START*/

// let pro = new Product({
//     product: "O3V2.0",
//     productLine: "AP",
//     member: ["zhuyi"],
//     copyTo: ["zhuyi"],
//     src: "http://192.168.100.233:18080/svn/GNEUI/SourceCodes/Trunk/GNEUIv1.0/O3v2_temp",
//     dist: "",
//     schedule: "tr1",
//     interval: "3"
// });

// let pro1 = new Product({
//     product: "O3V2.0",
//     productLine: "AP",
//     member: ["zhuyi"],
//     copyTo: ["zhuyi"],
//     src: "http://192.168.100.233:18080/svn/GNEUI/SourceCodes/Trunk/GNEUIv1.0/O3v2_temp",
//     dist: "",
//     localDist: "./public",
//     compileOrder: "start",
//     schedule: "tr1",
//     interval: "3"
// });
// pro1.packCompiled();
/**DEBUG:END*/

module.exports = Product;