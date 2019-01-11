const fs = require("fs");
const path = require("path");
const net = require("net");
const { oemConfig } = require("../../../../config/basic_config");
const { spawn } = require("child_process");
const fo = require("../../../util/fileOperation");
const SVN = require("../../../../svn_server/svn");
const _ = require("lodash");
const archiver = require("archiver");

/**
 * OEM类 
 * @desc 每当创建一个OEM项目时，会对应创建一个OEM类实例，OEM的各个操作对应OEM实例的各个函数
 */
class OEM {
    constructor() {
        //OEM实例自身的属性
        this.src = null; //OEM的src
        this.version = null; //OEM版本号
        this.name = null; //OEM名称
        this.lastUpdatedAt = Date.now(); //最近创建时间
        this.oemPath = null; //OEM项目在服务器的本地路径
        this.oemCfgPath = null; //OEM配置文件在服务器的本地路径

        //下面是预览界面的相关数据
        this.previewer = {
            spawn: null, //spawn实例
            isOnPreviewing: false, //是否正在预览中
            port: "", //预览端口
            pid: "", //web-debug预览进程PID
            childPid: "" //web-debug http进程PID
        };
        //是否开启调试模式，部署时设置为false
        this.debug = global.debug.oemProduct;

        //下面是OEM修改相关的配置
        this.htmlTypeSubfix = /\.(htm|html|gch|tpl)$/;

        this._startHttpServer = this._startHttpServer.bind(this);
    }

    /**
     * 更新OEM项目
     * 如果之前已经创建过该目录，则删除相关文件，重新下载
     * @param {*OEM配置项} options 
     */
    update(options) {
        return new Promise((resolve, reject) => {
            //更新配置信息
            this._updateOptions(options);
            //如果之前创建过这个项目，则把相关目录文件删除
            //调试模式下从本地获取
            try {
                !this.debug && fs.existsSync(this.oemPath) && fo.rmdirSync(this.oemPath);
            } catch (e) {
                //输出错误，但不中断
                console.log(`[OEM Error]:删除文件夹${this.oemPath}时发生错误  @${new Date()}`);
                console.log(e);
            }

            //从本地调试  避免svn服务器崩溃。。。。
            if (this.debug) {
                resolve();
            } else {
                this.exportCodes()
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    /**
     * 更新配置项
     * @param {*配置项} options 
     */
    _updateOptions(options) {
        this.src = options.src;
        this.version = options.version;
        this.name = options.name;

        this.oemPath = path.join(oemConfig.root, options.name);
        this.oemCfgPath = path.join(this.oemPath, "oem.config.js");
        this.updateTime();
    }

    /**
     * 将代码从svn下拉至本地
     */
    exportCodes() {
        return new Promise((resolve, reject) => {
            SVN
                .exportCode(this.src, this.oemPath, this.version)
                .then(resolve)
                .catch(reject);
        });
    }

    validate(field, value) {
        try {
            let result,
                config,
                validator,
                tabIndex = field.split("_")[0],
                itemIndex = field.split("_")[1];

            config = this.getConfig();
            validator = config[tabIndex].pageRules[itemIndex].validator;
            if (typeof validator == "function") {
                result = validator(value);
            } else {
                result = `${field}的validator is not a function`;
            }
            return result;
        } catch (e) {
            return `验证时${field}发生错误${e.message}`;
        }
    }

    /**
     * 替换图片
     * @param {*OEM相关信息} options 
     * @param {*文件信息} fileInfo 
     */
    replaceImg(options, fileInfo) {
        let config = this.getConfig(),
            dest = path.join(this.oemPath, config[options.tabIndex].pageRules[options.itemIndex].webOptions.where),
            src = fileInfo.path;

        fo.copySingleFile(src, dest);
    }

    /**
     * 获取OEM项目的配置
     * @param {*是否需要对配置文件进行处理} shouldParseConfig 为true时，会深复制一份配置，并且删除冗余配置
     */
    getConfig(shouldParseConfig = false) {
        if (!fs.existsSync(this.oemCfgPath)) {
            throw new ReferenceError(`[OEM Error]:该项目没有配置文件oem.config.js`);
        }

        try {
            let config = require(this.oemCfgPath);
            //获取配置之后需要清除node require模块下的缓存
            //如果不清除缓存，当用户在本地更新配置再上传到SVN，重新获取配置时还会是老的配置
            this._clearNodeCache(this.oemCfgPath);

            shouldParseConfig && (config = this._parseConfig(config));
            return config;
        } catch (e) {
            throw new Error(`[OEM Error]:项目OEM配置文件oem.config.js解析错误，请检查该文件 \n ${e.stack} `);
        }
    }

    /**
     * 删除node下模块引用的缓存
     * @param {*引用路径} modulePath 
     */
    _clearNodeCache(modulePath) {
        let mod = require.resolve(modulePath);

        if (!!mod && require.cache[mod]) {
            require.cache[mod].children.forEach(child => {
                this._clearNodeCache(child.filename);
            });
            delete require.cache[mod];
        }
    }

    /**
     * 处理一下config文件
     * 深复制一份，因为node会对require的内容缓存，不进行深复制会对原有引用进行改动
     * 然后剔除页面不需要的配置项
     * @param {*config文件} config 
     */
    _parseConfig(config) {
        //深复制一份，避免文件被改动
        return _.cloneDeep(config).map(el => {
            return {
                id: el.id,
                title: el.title,
                //剔除规则
                pageRules: el.pageRules.map(rule => {
                    rule.validator && (rule.hasValidator = true);
                    delete rule.rules;
                    delete rule.validator;
                    return rule;
                })
            };
        });
    }

    /**
     * 将用户输入的配置同步至代码文件中
     * @param {*用户输入的完整配置项} userConfig 
     */
    syncConfig(userConfig) {
        let localConfig = this.getConfig(),
            i, j,
            errors = [];

        //遍历项目的oem.config.js文件来修改
        for (i = 0; i < localConfig.length; i++) {
            let mainRule = localConfig[i];
            //如果是图片则不处理
            if (mainRule.id == "img") continue;
            for (j = 0; j < mainRule.pageRules.length; j++) {
                //用户输入的配置
                let toReplaceValue = userConfig[i].pageRules[j].value,
                    pageRule = mainRule.pageRules[j];
                //如果用户没有输入，那么就跳过
                if (!toReplaceValue) continue;
                //验证用户输入
                if (pageRule.validators) {
                    let err = this._validateUserInput(pageRule.validators, toReplaceValue);
                    errors = errors.concat(err);
                    //如果没有通过校验则跳至下一个替换
                    if (err.length > 0) continue;
                }

                //遍历所有的规则  
                pageRule.rules.forEach(curRule => {
                    //应用规格替换成用户输入
                    errors = errors.concat(
                        this
                        ._replaceToUserInput(curRule, toReplaceValue)
                        .map(el => `替换${pageRule.title}时出现问题:${el}`)
                    );
                });
            }
        }
        return errors;
    }

    /**
     * 判断是否为html类型的文件
     * 如果是html类型的文件则渲染注释tag 为   <!-- tag -->
     * 如果是css文件或js文件,那注释tag为 /*tag*/
    /* @param {*标签名} tag 
     * @param {*文件名} fileName 
     */
    _reRenderTag(tag, fileName) {
        let isHtml = this.htmlTypeSubfix.test(fileName),
            prefix = isHtml ? "<!--\\s*" : "\\/\\*\\s*",
            subfix = isHtml ? "\\s*-->" : "\\s*\\*\\/";

        return `${prefix}${tag}${subfix}`;
    }

    /**
     * 校验用户输入是否合法，如果不合法则需要传至页面通知用户
     * @param {*配置的校验规则} validators 
     * @param {*用户输入} userInput 
     */
    _validateUserInput(validators, userInput) {
        let result = [];
        switch (Object.prototype.toString.call(validators)) {
            case "[object Function]":
                {
                    result.push(validators(userInput));
                }
                break;
            case "[object Array]":
                {
                    validators.forEach(validator => {
                        typeof validator == "function" && result.push(validator(userInput));
                    });
                }
                break;
            case "[object Object]":
                {
                    let prop;
                    for (prop in validators) {
                        if (validators.hasOwnProperty(prop) && typeof validators[prop] == "function") {
                            result.push(validators[prop](userInput));
                        }
                    }
                }
                break;
            default:
                {
                    throw new TypeError("validators只能为函数、对象或数组");
                }
        }
        return result;
    }

    /**
     * 将用户输入的值替换到实际代码中去
     * @param {*当前的替换规则} curRule 
     * @param {*用户输入} toReplaceValue 
     */
    _replaceToUserInput(curRule, toReplaceValue) {
        let errs = [];
        //遍历所有需要寻找的文件，进行替换
        curRule.where.forEach(where => {
            let curPath = path.join(this.oemPath, where), //当前匹配的文件
                content = fs.readFileSync(curPath, "utf-8"), //文件内容
                tagReg, //标签正则表达式
                tagMatch, //标签正则匹配到的内容
                curTag = this._reRenderTag(curRule.tag, where); //当前匹配的标签

            //匹配tag标签中的内容
            tagReg = new RegExp(curTag + "\r?\n?((.*\r?\n?)*?.*)\r?\n?\\s*" + curTag, "g");
            tagMatch = tagReg.exec(content);

            //遍历所有的匹配，将该文件内所有的匹配都替换掉
            while (!!tagMatch) {
                try {
                    content = content.replace(tagMatch[1], curRule.how(tagMatch[1], toReplaceValue));
                } catch (e) {
                    //在服务器输出错误，但不中断,但是需要将这些错误储存起来告知用户
                    errs.push(`替换${curRule.title} e.stack`);
                    console.log(e);
                }
                tagMatch = tagReg.exec(content);
            }

            try {
                fs.writeFileSync(curPath, content, "utf-8");
            } catch (e) {
                errs.push(`修改${curPath.split(this.oemPath).top()}文件时出错`);
            }
        });

        return errs;
    }

    /**
     * 预览界面
     * @param {*是否为webpack项目} isWebpackProject 
     */
    preview(isWebpackProject = false) {
        return new Promise((resolve, reject) => {
            //暂时只处理非webpack项目
            if (!isWebpackProject) {
                //如果已经启用过
                if (this.previewer.isOnPreviewing) {
                    resolve(this.previewer.port);
                } else {
                    this._findFreePort()
                        .then(this._startHttpServer)
                        .then(resolve)
                        .catch(reject);
                }
            } else {
                //TODO: webpack项目主要要考虑如何联网
            }
        });
    }

    /**
     * 通过调用web-debug来启用一个http服务
     * @param {*http服务监听的端口号} port 
     */
    _startHttpServer(port) {
        //TODO: 这里用的是非常老的版本的web-debug，暂时发现的BUG有
        //1.杀死web-debug进程，http进程不会自动消亡，需要手动再杀一遍
        //2.产生的http子进程有时候无法杀死
        //3.产生的.pidTmp文件有时候无法访问
        //需要替换成新的http服务器
        return new Promise((resolve, reject) => {
            this.previewer.spawn = spawn("web-debug", [port], { cwd: this.oemPath, shell: true });
            //记录pid信息
            this.previewer.pid = this.previewer.spawn.pid;
            this.previewer.spawn.on("error", err => {
                console.log(`[OEM Error]:启动web-debug ${port}时发生异常`);
                console.log(err);
                reject(new Error("[OEM Error]:调用web-debug出现异常,请重试"));
            });

            //尝试去获取子进程的PID
            //3s后获取不到则不管了
            let times = 0,
                timer = setInterval(() => {
                    if (times > 6) {
                        clearInterval(timer);
                        this.previewer.port = port;
                        this.previewer.isOnPreviewing = true;
                        resolve(port);
                    } else {
                        try {
                            let pidContent = fs.readFileSync(path.join(this.oemPath, "./.pidTmp"), "utf-8");
                            this.previewer.childPid = pidContent.split("\r\n")[0];
                            this.previewer.port = port;
                            this.previewer.isOnPreviewing = true;
                            clearInterval(timer);
                            resolve(port);
                        } catch (e) {
                            //不要输出错误
                        } finally {
                            times++;
                        }
                    }
                }, 500);
        });
    }

    /**
     * 在服务器上查找一个未被占用的端口
     * @return {Promise resolve} 查找到的端口号
     */
    _findFreePort() {
        let loopTimes = 0,
            upperTimes = 30;

        return new Promise((resolve, reject) => {
            function _loopPromise(func) {
                return function() {
                    if (++loopTimes >= upperTimes) {
                        reject(new Error("服务器找不到空闲端口，请重新尝试"));
                    } else {
                        Promise.resolve()
                            .then(func)
                            .then(resolve)
                            .catch(_loopPromise(func));
                    }
                };
            }

            //无穷循环_testRandomPort
            Promise.resolve()
                .then(this._testRandomPort)
                .then(resolve)
                .catch(_loopPromise(this._testRandomPort));
        });
    }

    /**
     * 随机生成一个port   @range 1000 ~ 65535
     * 如果这个port没有被占用则reject
     * reject后会被loopPromise中catch到
     * 如果占用则
     */
    _testRandomPort() {
        return new Promise((resolve, reject) => {
            let port = Math.floor(Math.random() * (65535 - 1000)) + 1000,
                server = net.createServer().listen(port);

            server.on("listening", () => {
                server.close();
                resolve(port); //跳出循环
            });

            server.on("error", err => {
                //端口被占用
                if (err.code == "EADDRINUSE") {
                    reject(); //继续查找  
                } else {
                    console.log(err);
                    reject();
                }
            });
        });
    }

    /**
     * 删除OEM项目文件夹
     */
    clean() {
        //调试模式下不要删除
        if (this.debug) return;
        try {
            //删除文件目录
            fo.rmdirSync(this.oemPath);
            //删除zip压缩包  如果有的话
            fs.existsSync(`${this.oemPath}.zip`) && fs.unlinkSync(`${this.oemPath}.zip`);
        }
        catch (e) {
            console.log(`[OEM Error]:尝试删除${this.oemPath}时出错`);
            console.log(e);
        }
    }

    compress() {
        return new Promise((resolve, reject) => {
            let output = fs.createWriteStream(`${this.oemPath}.zip`),
                archive = archiver("zip"),
                hasError = false;

            archive.on("error", err => {
                console.log(err);
                hasError = true;
                reject({
                    status: "error",
                    errMessage: err
                });
            });
            archive.on("warning", err => {
                console.log(err);
                hasError = true;
                reject({
                    status: "error",
                    errMessage: err
                });
            });
            output.on('close', () => {
                console.log(`${this.name}.zip has ${archive.pointer()} total bytes`);
                !hasError && resolve();
            });
            archive.pipe(output);
            archive.directory(this.oemPath, false);
            archive.finalize();
        });
    }

    updateTime() {
        this.lastUpdated = Date.now();
        return this;
    }
}

module.exports = OEM;