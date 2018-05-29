const {
    spawn
} = require("child_process");
const fs = require("fs");

// check whether constructor options is valid
function checkOptionsValid(sv, pr) {
    //user&&pass&&root properties in svnconfig is required;
    if (typeof sv.user == "undefined" || typeof sv.pass == "undefined" || typeof sv.root == "undefined") {
        return false;
    }

    //path of product is required
    if (typeof pr.path == "undefined") {
        return false;
    }

}


class SVN {
    constructor(svnConfig, productConfig) {
        /**
         * productConfig.path represents the project path on svn server
         * productConfig.localPath represents the project path copy on local server
         */

        if (checkOptionsValid(svnConfig, productConfig)) {
            throw new Error("config error in SVN constructor");
        }

        //mark the status of svn entity
        this.isRunning = false;

        this.svnConfig = svnConfig;
        this.productConfig = productConfig;
        
        //在根目录下创建子目录来接受项目文件
        !fs.existsSync(this.productConfig.localPath) &&　fs.mkdirSync(this.productConfig.localPath);
        
        //enable debug will print more information
        this.debug = productConfig.debug;
        //alias of checkout
        this.co = this.checkout;
        //has down checkout actions?
        this.checkouted = false;
    }

    //下拉代码
    checkout() {
        let that = this;
        return new Promise((resolve, reject) => {
            let text = "",
                sp = spawn("svn", ["co", that.productConfig.path, that.productConfig.localPath, "--username", that.svnConfig.user, "--password", that.svnConfig.pass], {
                    encoding: 'utf-8'
                });

            if (that.checkouted) {
                resolve("already checkouted");
            }

            if (that.isRunning) {
                reject("another process is running");
            }
            that.isRunning = true;

            //process error
            sp.on("err", (err) => {
                !!that.debug && console.log("error when excute svn checkout");
                that.isRunning = false;
                reject("执行svn checkout时进程错误");
            });

            //std error
            sp.stderr.on('data', (data) => {
                data = String(data)
                that.isRunning = false;
                reject("std error\n" + data);
            });

            //collect std stream information
            sp.stdout.on("data", (data) => {
                text += data;
            });

            //close
            sp.stdout.on("close", () => {
                !!that.debug && console.log("SVN checkout完毕");
                that.checkouted = true;
                that.isRunning = false;
                resolve(text);
            });

        });

    }

    log() {
        let that = this;
        return new Promise((resolve, reject) => {
            let text, sp = spawn('svn', ["log", "-l", "1", that.productConfig.path]);

            if (that.isRunning) {
                reject("another process is running");
            }
            that.isRunning = true;

            //process error
            sp.on("err", (err) => {
                !!that.debug && console.log("error when excute svn log");
                that.isRunning = false;
                reject("error when excute svn log");
            });

            //std error
            sp.stderr.on('data', (data) => {
                data = String(data)
                that.isRunning = false;
                reject("std error\n" + data);
            });

            //collect std stream information
            sp.stdout.on("data", (data) => {
                text += data;
            });

            sp.stdout.on("close", () => {
                !!that.debug && console.log("svn log success");
                that.checkouted = true;
                that.isRunning = false;
                resolve(text);
            });

        });
    }

    command(options) {
        let that = this;
        return new Promise((resolve, reject) => {
            let text = "",
                commander = options.command,
                args = options.args,
                opt = options.options,
                sp = spawn(options.command, options.args, options.options);


            if (that.isRunning) {
                reject("another process is running");
            }
            that.isRunning = true;

            //process error
            sp.on("err", (err) => {
                !!that.debug && console.log(`error when excute ${commander} ${args[0]}`);
                that.isRunning = false;
                reject(`error when excute ${commander} ${args[0]}`);
            });

            //std error
            sp.stderr.on('data', (data) => {
                data = String(data)
                that.isRunning = false;
                reject("std error\n" + data);
            });

            //collect std stream information
            sp.stdout.on("data", (data) => {
                text += data;
            });

            sp.stdout.on("close", () => {
                !!this.debug && console.log(`${commander} ${args[0]}success`);
                that.checkouted = true;
                that.isRunning = false;
                resolve(text);
            });

        });


    }

};

module.exports = SVN;