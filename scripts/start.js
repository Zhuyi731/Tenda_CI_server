/**
 * @author : Zhuyi
 * @data :　18.12.14
 * @desc：启动服务器的脚本
 * 1.先去检查server/web目录下是否有dist目录
 * 2.如果没有dist目录说明Vue项目没有编译，需要调用npm编译。编译完毕后再启动服务
 * 3.调用pm2来进行进程守护，防止服务器down掉。
 * @version：0.0.1
 */
const path = require("path");
const fs = require("fs");
const https = require("https");
const child_process = require("child_process");

class Starter {
    constructor() {
        this.webRootPath = path.join(__dirname, "../server/web/dist");
        this.startFilePath = "server/http_server/server.js";
        this.args = process.argv;
        this.installDependencies = this.installDependencies.bind(this);
        this.compileWebResource = this.compileWebResource.bind(this);
        this.startPm2 = this.startPm2.bind(this);
    }

    start() {
        this.isOffline()
            .then(this.installDependencies)
            .then(this.compileWebResource)
            .then(this.startPm2)
            .then(() => {
                console.log("/**************************************/");
                console.log(`    pm2服务启动    `);
                console.log(`    如需关闭服务器，请使用指令npm run stop`);
                console.log("/**************************************/");
            })
            .catch(err => {
                console.log(err);
            });
    }

    //检查是否联网
    isOffline() {
        return new Promise((resolve, reject) => {
            this.log(`检查网络连接状态`);
            https
                .get("https://www.npmjs.com", res => {
                    // let chunk = "";
                    res.on("data", data => {
                        // console.log(data);
                        // data += chunk;
                    });
                    res.on("end", () => {
                        this.log(`网络通畅`);
                        resolve();
                    });
                })
                .on("error", err => {
                    console.log(`无法连接至npmjs.com`);
                    console.log("");
                    switch (err.code) {
                        case "UNABLE_TO_VERIFY_LEAF_SIGNATURE":
                            {
                                console.log(`兄弟，你忘记登录了。`);
                            }
                            break;
                        case "ENOTFOUND":
                            {
                                console.log("检查一下是不是忘记插网线了啊");
                            }
                            break;
                        default:
                            {
                                console.log("网络错误");
                            }
                    }
                    reject(err);
                });
        });

    }

    //安装依赖   
    //需要安装的依赖项[r-check,sesame-http,pm2]
    installDependencies() {
        return new Promise(resolve => {
            this.log(`检查依赖安装情况`);
            this.tryAndInstallPackages("pm2")
                .then(() => {
                    return this.tryAndInstallPackages("r-check");
                })
                .then(() => {
                    return this.tryAndInstallPackages("sesame-http", "sesame");
                })
                .then(resolve)
                .catch(e => {
                    throw new Error(e);
                });
        });
    }

    tryAndInstallPackages(packageName, cmd) {
        cmd = cmd || packageName;
        return new Promise((resolve, reject) => {
            try {
                this.log(`检查${packageName}是否安装`);
                child_process.execSync(`${cmd} -v`);
                this.log(`${packageName}已经安装`);
                resolve();
            } catch (e) {
                this.log(`${packageName}未安装,安装中,请稍等...(安装过程注意保持网络通畅)`);
                try {
                    child_process.execSync(`npm i ${packageName} -g`);
                    this.log(`${packageName}安装完毕`);
                    resolve();
                } catch (e) {
                    reject(new Error(`${packageName}安装过程中出现错误，请手动安装后重试`));
                }
            }
        });
    }

    compileWebResource() {
        return new Promise((resolve, reject) => {
            this.log(`检查web目录是否编译`);

            if (this._isWebCompiled()) {
                this.log(`web目录已经编译`);
                resolve();
            } else {
                this.log(`web目录未编译，编译中...`);
                child_process.execSync(`node build/build.js`, {
                    cwd: path.join(this.webRootPath, "../")
                });
                this.log(`web目录编译完毕`);
                resolve();
            }
        });
    }

    //通过pm2来开启服务器
    //如果需要关闭，则需要通过
    startPm2() {
        return new Promise((resolve, reject) => {
            try {
                child_process.execFileSync(`pm2 start server/http_server/server.js --name CI`, {
                    cwd: path.join(__dirname, "../"),
                    shell: true
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    log(msg) {
        console.log("");
        console.info(`[Log]:${msg}`);
        console.log("");
    }

    _isWebCompiled() {
        return fs.existsSync(this.webRootPath) && fs.readdirSync(this.webRootPath).length > 0;
    }
}

const starter = new Starter();
starter.start();