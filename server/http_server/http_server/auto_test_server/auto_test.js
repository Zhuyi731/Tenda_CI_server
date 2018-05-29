const SVN = require("../../svn_server/svn");
// const Mailer = require("../../mail_server/mail");
global.debug = true;
const {
    spawn
} = require("child_process");

//svn 配置
const {
    svnConfig
} = require("../../config/basic_config");
//邮箱配置
const mailConfig = require("../../config/mail_config");


class Product {

    constructor(config) {
        this.config = config;

        this.config.interval = parseInt(this.config.interval) * 60 * 60 * 1000;

        //检测定时器
        this.timer = null;

        //上一次检查的时间  @format : time stamp
        this.lastCheckTime = 0;
        this.fullPath = svnConfig.root + "\\" + this.config.product;

        //项目名
        this.name = config.product;
        this.debug = global.debug;

        //生成项目对应的svn实例
        this.svn = new SVN(svnConfig, {
            path: this.config.src,
            localPath: this.fullPath,
            name: this.name,
            debug: global.debug
        });
        //生成项目对应的邮件发送器实例
        // this.mailer = new Mailer({

        // });


    }

    hasUpdate() {

        return new Promise((resolve, reject) => {
            let that = this;

            //用function防止that无法使用
            this.svn.log()
                .then(function (data) {
                    let time = data.toString("utf-8").split("|")[2].split("(")[0];
                    //获取时间戳
                    time = new Date(time).getTime();
                    //如果在上次检查后更新了代码，则返回true
                    if (time > that.lastCheckTime) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch(err => {
                    reject(err);
                });
        })
    }

    /**
     * 第一次启动测试
     * 
     */
    start() {
        let that = this;
        //将于当时立即开启检测
        //TODO: 可以调整到晚上24点之后再检测
        /**
         * 1.首先从svn上checkout对应的代码
         * 2.然后生成配置文件
         * 3.然后进行测试
         */
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
                that.runTest()
            }, 10000);

            //没有代码更新则返回
            if (!isUpdated) return;

            //更新检查时间
            that.lastCheckTime = new Date().getTime();
            that.checkCode().then((text, hasError) => {
                if (hasError) {
                    that.mailToPerson();
                }
            });

        }).catch(err => {
            console.log(err)
        });

    }
    /**
     * 生成配置文件
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

    checkCode() {
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
    mailToPerson() {

    }

    stop() {
        this.lastCheckTime = 0;
        !!this.timer && clearTimeout(this.timer);
        this.timer = null;
    }

}


function wrapSpawn(that, sp, resolve, reject) {
    let text = "",
        hasError = false,
        errorText = "";
    //process error
    sp.on("err", (err) => {
        console.log("error when excute svn checkout");
        reject("进程错误");
    });

    //std error
    sp.stderr.on('data', (data) => {
        errorText += String(data);
        hasError = true;
    });

    //collect std stream information
    sp.stdout.on("data", (data) => {
        text += data;
    });

    sp.stdout.on("close", () => {
        !!that.debug && console.log(text, errorText);
        resolve(hasError ? errorText : text, hasError);
    });
}


/**debug */
!Product.products && (Product.prototype.products = []);

let pro = new Product({
    product: "03V2.0",
    productLine: "AP",
    src: "http://192.168.100.233:18080/svn/GNEUI/SourceCodes/Trunk/GNEUIv1.0/O3v2_temp",
    dist: "",
    isOld: "1",
    schedule: "tr1",
    interval: "3",
    remarks: ""
});


pro.start();

module.exports = Product;