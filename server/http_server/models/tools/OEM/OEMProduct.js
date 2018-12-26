const fs = require("fs");
const path = require("path");
const { oemConfig } = require("../../../../config/basic_config");
const fo = require("../../../util/fileOperation");
const SVN = require("../../../../svn_server/svn");

class OEM {
    constructor() {
        //OEM实例自身的属性
        this.src = null;
        this.version = null;
        this.name = null;
        this.killTimer = null;
        this.lastUpdated = Date.now();
        this.oemPath = null;
        this.oemCfgPath = null;
        //下面是OEM修改相关的配置
        this.htmlTypeSubfix = /\.(htm|html|gch|tpl)$/;
    }

    update(options) {
        return new Promise((resolve, reject) => {
            //更新配置信息
            this.updateOptions(options);
            //如果之前创建过这个项目，则把相关目录文件删除
            try {
                fs.existsSync(this.oemPath) && fo.rmdirSync(this.oemPath);
            } catch (e) {
                //输出错误，但不中断
                console.log(`[OEM Error]:删除文件夹${this.oemPath}时发生错误`);
                console.log(e);
            }

            //通过svn export 来下拉代码    不要通过svn pull来下拉
            this
                .exportCodes()
                .then(resolve)
                .catch(reject);
        });
    }

    updateOptions(options) {
        this.src = options.src;
        this.version = options.version;
        this.name = options.name;
        this.lastUpdated = Date.now();
        this.oemPath = path.join(oemConfig.root, options.name);
        this.oemCfgPath = path.join(this.oemPath, "oem.config.js");
    }

    exportCodes() {
        return new Promise((resolve, reject) => {
            SVN
                .exportCode(this.src, this.oemPath, this.version)
                .then(resolve)
                .catch(reject);
        });
    }

    getConfig() {
        if (!fs.existsSync(this.oemCfgPath)) {
            throw new ReferenceError(`[OEM Error]:该项目没有配置文件oem.config.js`);
        }

        try {
            let config = require(this.oemCfgPath);
            return config;
        } catch (e) {
            throw new Error(`[OEM Error]:项目OEM配置文件oem.config.js解析错误，请检查该文件 \n ${e.stack} `);
        }
    }

    syncConfig(userConfig) {
        let localConfig = this.getConfig(),
            i, j, k,
            errors = [];

        //遍历项目的oem.config.js文件来修改
        for (i = 0; i < localConfig.length; i++) {
            if (localConfig[i].id == "img") continue;

            for (j = 0; j < localConfig[i].pageRules.length; j++) {
                //用户输入的配置
                let toReplaceValue = userConfig[i].pageRules[j].value;
                //如果这个值不需要替换，那么就跳过
                if (!toReplaceValue) continue;

                for (k = 0; k < localConfig[i].pageRules[j].rules.length; k++) {
                    //当前的配置规则
                    let curRule = localConfig[i].pageRules[j].rules[k];
                    //遍历所有需要寻找的文件，进行替换
                    curRule.where.forEach(where => {
                        let content,
                            tagReg,
                            tagMatch,
                            curTag = this._reRenderTag(_.cloneDeep(curRule).tag, where),
                            curPath = path.join(this.oemPath, where);

                        //为tag加上注释的前后缀
                        content = fs.readFileSync(curPath, "utf-8");
                        //匹配tag标签中的内容
                        tagReg = new RegExp(curTag + "\r?\n?((.*\r?\n?)*?.*)\r?\n?\\s*" + curTag, "g");
                        tagMatch = tagReg.exec(content);

                        //遍历所有的匹配，将该文件内所有的匹配都替换掉
                        while (!!tagMatch) {
                            try {
                                content = content.replace(tagMatch[1], curRule.how(tagMatch[1], toReplaceValue));
                            } catch (e) {
                                //在服务器输出错误，但不中断,但是需要将这些错误储存起来告知用户
                                errors.push(e.stack);
                                console.log(e);
                            }
                            tagMatch = tagReg.exec(content);
                        }

                        try {
                            fs.writeFileSync(curPath, content, "utf-8");
                        } catch (e) {

                        }
                    });
                }
            }
        }
    }

    _reRenderTag(tag, fileName) {
        //是否为html类型的文件
        //如果是html类型的文件则渲染注释tag 为   <!-- tag -->
        if (this.htmlTypeSubfix.test(fileName)) {
            tag = "<!--" + tag + "-->";
        } else {
            //需要双重转义
            //如果是css文件或js文件,那注释tag为 /*tag*/
            tag = "\\/\\*" + tag + "\\*\\/";
        }
        return tag;
    }
}
module.exports = OEM;