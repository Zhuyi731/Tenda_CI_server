const {
    spawn
} = require("child_process");
const svnConfig = require("../config/basic_config").svnConfig;

const fs = require("fs");

class SVN {
    constructor(productConfig) {
        //mark the status of svn entity
        this.isRunning = false;
        this.svnConfig = svnConfig;
        this.productConfig = productConfig;

        //在根目录下创建子目录来接受项目文件
        if (this.productConfig.localPath) {
            !fs.existsSync(this.productConfig.localPath) && fs.mkdirSync(this.productConfig.localPath);
        }
        //enable debug will print more information
        this.debug = global.debug.svn;
        //alias of checkout
        this.co = this.checkout;
        //has down checkout actions?
        this.checkouted = false;
    }

    /**
     * 执行 svn checkout操作
     * 从svn服务器下拉代码
     */
    checkout() {
        let that = this;
        return new Promise((resolve, reject) => {
            let sp = spawn("svn", ["co",
                that.productConfig.path,
                that.productConfig.localPath,
                "--username", that.svnConfig.user,
                "--password", that.svnConfig.pass
            ], {
                encoding: 'utf-8'
            });

            wrapSpawn(that, sp, resolve, reject, "checkout");
            that.checkouted = true;
            console.log(`svn checkout:${that.productConfig.name}`);
        });
    }

    /**
     * 执行 svn log指令
     * 获取最近的一条log
     * @return (返回最近的日志)
     */
    log() {
        let that = this;
        return new Promise((resolve, reject) => {
            let sp = spawn('svn', ["log",
                "-l",
                "1",
                that.productConfig.path,
                "--username", that.svnConfig.user,
                "--password", that.svnConfig.pass
            ]);

            wrapSpawn(that, sp, resolve, reject, "log");
        });
    }

    /**
     * 执行svn up操作
     * 更新代码
     */
    updateCode() {
        let that = this;
        return new Promise((resolve, reject) => {
            let sp = spawn('svn', ["up"], {
                cwd: that.productConfig.localPath
            });
            wrapSpawn(that, sp, resolve, reject, "up");
        });
    }

    command(options) {
        let that = this;
        return new Promise((resolve, reject) => {
            let commander = options.command,
                args = options.args,
                opt = options.options,
                sp = spawn(options.command, options.args, options.options);

            wrapSpawn(that, sp, resolve, reject);
        });
    }

    /**
     * svn export操作
     * 同checkout一样下拉代码但是没有.svn文件
     * @param {src} svn路径
     * @param {localPath}  本地路径   
     * @param {version} export对应的svn版本号
     */
    static exportCode(src, localPath, version) {
        let that = this;
        return new Promise((resolve, reject) => {
            let args = ["export",
                src,
                localPath,
                "--username", svnConfig.user,
                "--password", svnConfig.pass,
                "--force"
            ];
            version && args.splice(1, 0, "-r", version);

            let sp = spawn('svn', args);
            wrapSpawn(that, sp, resolve, reject, "export");
            console.log(`svn export:${localPath}`);
        });
    }

    static checkSrc(src, version) {
        return new Promise((resolve, reject) => {
            let timeout = true;
            setTimeout(() => {
                timeout && reject({
                    status: "error",
                    errMessage: "SVN连接服务器超时"
                });
            }, 30000);
            let args = ['log',
                "-l",
                "1",
                src,
                "--username", svnConfig.user,
                "--password", svnConfig.pass
            ];
            //如果是要指定版本  则把svn log 指令修改
            if (version) {
                args[1] = "-r";
                args[2] = version;
            }
            let sp = spawn("svn", args),
                hasErr = false;

            sp.stderr.on('data', (data) => {
                data = String(data);
                console.log("检查SVN路径出错:", data);
                hasErr = true;
                timeout = false;
            });

            sp.stdout.on("data", (data) => {
                timeout = false;
                console.log(data.toString("utf-8"));
            });

            sp.stdout.on("close", (data) => {
                timeout = false;
                if (hasErr) {
                    reject({
                        status: "error",
                        message: version ? "src路径错误或版本错误" : "src路径错误"
                    });
                } else {
                    resolve({
                        status: "ok"
                    });
                }
            });
        });
    }
}

/**
 * 封装spawn实例返回std流信息
 * @param {*上下文} that 
 * @param {*spawn实例} sp 
 * @param {*emmmm} resolve 
 * @param {*ueeeee} reject 
 */
function wrapSpawn(that, sp, resolve, reject, type) {
    let text = "",
        hasError = false,
        errorText = [];
    if (that.isRunning) {
        reject("another process is running");
    }

    that.isRunning = true;
    that.isTimeout = true;

    //3s内没有收到任何信息则认为是超时
    setTimeout(() => {
        if (that.isTimeout) {
            reject({
                status: "error",
                errMessage: "SVN服务器连接超时"
            });
        }
    }, svnConfig.svnTimeout);

    //process error
    sp.on("err", (err) => {
        that.isRunning = false;
        console.log(err);
        reject("进程错误");
    });

    //std error
    sp.stderr.on('data', (data) => {
        that.isTimeout = false;
        errorText.push(data.toString("utf-8"));
        hasError = true;
        svnConfig.typeToConsole.has(type) && console.log(data.toString("utf-8"));
    });

    //collect std stream information
    sp.stdout.on("data", (data) => {
        text += data;
        that.isTimeout = false;
        svnConfig.typeToConsole.has(type) && console.log(data.toString("utf-8"));
    });

    sp.stdout.on("close", () => {
        that.isRunning = false;
        that.isTimeout = false;
        resolve({
            text: hasError ? errorText : text,
            hasError: hasError
        });
    });



}

// SVN.prototype.checkSrc = (src) => {
//     return new Promise((resolve, reject) => {
//         let timeout = true;
//         setTimeout(() => {
//             timeout && reject({
//                 status: "error",
//                 errMessage: "SVN连接服务器超时"
//             });
//         }, 30000);

//         let sp = spawn("svn", ['log', "-l", "1", src, "--username", svnConfig.user, "--password", svnConfig.pass]),
//             hasErr = false;

//         sp.stderr.on('data', (data) => {
//             data = String(data);
//             console.log("检查SVN路径出错:", data);
//             hasErr = true;
//             timeout = false;
//         });

//         sp.stdout.on("data", (data) => {
//             timeout = false;
//             console.log(data.toString("utf-8"));
//         });

//         sp.stdout.on("close", (data) => {
//             timeout = false;
//             if (hasErr) {
//                 reject({
//                     status: "error",
//                     errMessage: "src路径错误"
//                 });
//             } else {
//                 resolve({
//                     status: "ok"
//                 });
//             }
//         });
//     });
// };

module.exports = SVN;