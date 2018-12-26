/**
 * @author zhuyi
 * @desc 此文件所在层级位于服务器Controller层，用于处理逻辑。
 * @license MIT license
 * @Version V1.0.0
 * @last modify 2018.8.2
 * @title OEM定制逻辑处理
 */
const SVN = require("../../../svn_server/svn");
const oemConfig = require("../../../config/basic_config").oemConfig;
const fs = require("fs");
const fo = require("../../util/fileOperation");
const path = require("path");
const spawn = require("child_process").spawn;
const _ = require("lodash");
const previewManager = require("../../models/tools/previewManager");
const archiver = require("archiver");
const OEMManager = require("../../models/tools/OEM/OEMManager");

class OEMController {
    constructor() {
        //OEM自动超时时间   Default:1h
        this.timeout = 60 * 60 * 1000;
        this.cfgFileName = "oem.config.js";
        this.OEMs = {};
    }
    /**
     * 在OEM路径下创建一个OEM临时文件夹，然后在这里对OEM文件进行处理
     * @param {*定制名称} name 
     * @param {*src路径} src 
     * @param {*svn版本} version 
     */
    createOem(options) {
        /**
         * 首先，检查当前目录是否存在该定制
         * 没有则下拉代码
         * 然后读取配置并返回
         */
        return new Promise((resolve, reject) => {
            //检查SVN路径和版本是否正确
            SVN
                .checkSrc(options.src, options.version)
                //下拉代码  通过调用svn export来下拉代码   不要通过svn co来下拉 否则会有.svn文件夹
                .then(() => {
                    return OEMManager.creatOEMEntity(options);
                })
                .then(OEMEntity => {
                    return OEMEntity.getConfig();
                })
                .then(config => {
                    resolve({
                        status: "ok",
                        config: this._dealConfig(config)
                    });
                })
                .catch(err => {
                    reject({
                        status: "error",
                        errMessage: err.message
                    });
                });
        });
    }

    _dealConfig(config) {
        //深复制一份，避免文件被改动
        config = _.cloneDeep(config);
        config = config.map(el => {
            return {
                id: el.id,
                title: el.title,
                //剔除规则
                pageRules: el.pageRules.map(rule => {
                    delete rule.rules;
                    return rule;
                })
            }
        });
        return config;
    }

    /**
     * 根据web页面的配置去相应的目录下修改源码
     * @param {*配置} config 
     * @param {*名称} name 
     */
    setConfig(config, name) {
        //获取实例
        let OEMEntity = OEMManager.getOEMEntity(name);
        //将用户的配置同步至代码中
        let errors = OEMEntity.syncConfig(config);
        return errors;
        // //这个是要修改的项目在服务器本地的目录
        // let projectPath = path.join(oemConfig.root, name),
        //     //这个是配置文件
        //     projectConfig = require(path.join(projectPath, "oem.config.js")),
        //     i, j, k;

        // //遍历项目的oem.config.js文件来修改
        // for (i = 0; i < projectConfig.length; i++) {
        //     if (projectConfig[i].id == "img") {
        //         continue;
        //     }
        //     else {
        //         for (j = 0; j < projectConfig[i].pageRules.length; j++) {
        //             //用户输入的配置
        //             let toReplaceValue = config[i].pageRules[j].value;
        //             //如果这个值不需要替换，那么就跳过
        //             if (!toReplaceValue) continue;

        //             for (k = 0; k < projectConfig[i].pageRules[j].rules.length; k++) {
        //                 //当前的配置规则
        //                 let curRule = projectConfig[i].pageRules[j].rules[k];
        //                 //遍历所有需要寻找的文件，进行替换
        //                 curRule.where.forEach(where => {
        //                     let content,
        //                         tagReg,
        //                         tagMatch,
        //                         curTag = reRenderTag(_.cloneDeep(curRule).tag, where),
        //                         curPath = path.join(projectPath, where);

        //                     //为tag加上注释的前后缀
        //                     content = fs.readFileSync(curPath, "utf-8");
        //                     //匹配tag标签中的内容
        //                     tagReg = new RegExp(curTag + "\r?\n?((.*\r?\n?)*?.*)\r?\n?\\s*" + curTag, "g");
        //                     tagMatch = tagReg.exec(content);

        //                     //遍历所有的匹配，将该文件内所有的匹配都替换掉
        //                     while (!!tagMatch) {
        //                         try {
        //                             content = content.replace(tagMatch[1], curRule.how(tagMatch[1], toReplaceValue));
        //                         } catch (error) {}
        //                         tagMatch = tagReg.exec(content);
        //                     }
        //                     fs.writeFileSync(curPath, content, "utf-8");
        //                 });
        //             }
        //         }
        //     }
        // }

        // function reRenderTag(tag, fileName) {
        //     if (/(\.html|\.htm)$/.test(fileName)) {
        //         tag = "<!--" + tag + "-->";
        //     } else {
        //         //需要双重转义
        //         tag = "\\/\\*" + tag + "\\*\\/";
        //     }
        //     return tag;
        // }
    }

    /**
     * 调用web-debug来浏览
     */
    preview(name) {
        let pre = previewManager.getPreview(name);
        if (!!pre) {
            //更新一下定时器
            previewManager.refresh(name);
            return pre.port;
        } else {
            let port;
            do {
                port = parseInt(Math.random() * 30000);
            } while (!(port > 1000 && port < 30000))
            let sp = spawn("web-debug", [port], {
                    cwd: path.join(oemConfig.root, name),
                    shell: true
                }),
                curPre = {
                    name,
                    port,
                    pid: sp.pid,
                    pidPath: path.join(oemConfig.root, name, "./.pidTmp")
                };

            previewManager.push(curPre);
            return port;
        }
    }

    /**
     * 
     * @param {*压缩代码} name 
     */
    compressCode(name) {
        return new Promise((resolve, reject) => {
            let output = fs.createWriteStream(path.join(oemConfig.root, `${name}.zip`)),
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
            output.on('close', function() {
                console.log(name + ".zip has " + archive.pointer() + ' total bytes');
                !hasError && resolve();
            });
            archive.pipe(output);
            archive.directory(path.join(oemConfig.root, name), false);
            archive.finalize();
        });

    }

    getDownloadPath(name) {
        return path.join(oemConfig.root, `${name}.zip`);
    }

    /**
     * 从svn上下拉代码
     */
    exportCode(name, src) {
        let tpSvn = new SVN({
            path: src,
            localPath: path.join(oemConfig.root, name)
        }).export();
        return tpSvn.export();
    }

}

const crter = new OEMController();
//DEBUG:START
// crter.createOem({
//     src: "http://192.168.100.233:18080/svn/EROS/SourceCodes/Branches/A18/develop_svn2389/prod/httpd/web/A18",
//     name: "A18-ROC",
//     version: "6153"
// });
//DEBUG:END
// DEBUG:START
// let debugConfig = [{
//     "id": "title",
//     "pageRules": [{
//         "name": "pc-title-login",
//         "value": "hahah"
//     }, {
//         "name": "pc-title-quickset"
//     }, {
//         "name": "pc-title-index"
//     }, {
//         "name": "mobile-title-login"
//     }, {
//         "name": "mobile-title-quickset"
//     }]
// }, {
//     "id": "href",
//     "pageRules": [{
//         "name": "link-cn"
//     }, {
//         "name": "href-en",
//         "value": "www.baidu.com"
//     }]
// }]
// crter.setConfig(debugConfig, "A18-ROC")
//DEBUG:END
module.exports = crter;