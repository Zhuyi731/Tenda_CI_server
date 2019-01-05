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
const path = require("path");
const OEMManager = require("../../models/tools/OEM/OEMManager");
const dbModel = require("../../../datebase_mysql/dbModel");

class OEMController {
    constructor() {
        //OEM自动超时时间   Default:1h
        this.timeout = 60 * 60 * 1000;
        this.cfgFileName = "oem.config.js";
        this.OEMs = {};
    }

    getAllOemBaseLines() {
        return new Promise((resolve, reject) => {
            dbModel.tableModels.OEM
                .findAll()
                .then(data => {
                    data = data.map(el => el.dataValues.product);
                    resolve(data);
                })
                .catch(reject);
        });
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
            //通过主线名称查询src路径
            dbModel.tableModels.OEM
                .findOne({
                    attributes: ["src"],
                    where: {
                        product: {
                            "$eq": `${options.baseLine}`
                        }
                    }
                }).then(data => {
                    //检查版本号是否正确
                    options.src = data.dataValues.src;
                    return SVN.checkSrc(data.dataValues.src, options.version);
                })
                .then(() => {
                    //正确的话，创建OEM实例
                    return OEMManager.creatOEMEntity(options);
                })
                .then(OEMEntity => {
                    //调用实例的getConfig方法获取OEM实例的配置
                    return OEMEntity.getConfig(true);
                })
                .then(config => {
                    //给页面返回对应的配置
                    resolve({
                        status: "ok",
                        config
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

    validate(name, field, value) {
        let OEMEntity = OEMManager.getOEMEntity(name),
            result = OEMEntity.validate(field, value);
        return result;
    }


    /**
     * 根据web页面的配置去相应的目录下修改源码
     * @param {*配置} config 
     * @param {*名称} name 
     */
    setConfig(config, name) {
        let OEMEntity = OEMManager.getOEMEntity(name), //获取实例
            warns = OEMEntity.syncConfig(config); //将用户的配置同步至代码中
        return warns;
    }

    /**
     * 预览界面
     * @param {*项目名称} name 
     * @param {*是否为webpack项目 TODO:预留项} isWebpackProject 
     */
    preview(name, isWebpackProject) {
        return new Promise((resolve, reject) => {
            OEMManager
                .preview(name, isWebpackProject)
                .then(resolve)
                .catch(reject);
        });
    }

    /**
     * 
     * @param {*压缩代码} name 
     */
    compressProject(name) {
        return new Promise((resolve, reject) => {
            OEMManager
                .compressProject(name)
                .then(resolve)
                .then(reject);
        });
    }

    getDownloadPath(name) {
        return path.join(oemConfig.root, `${name}.zip`);
    }
}

const crtler = new OEMController();
//DEBUG:START
// crter.createOem({
//     src: "http://192.168.100.233:18080/svn/EROS/SourceCodes/Branches/A18/develop_svn2389/prod/httpd/web/A18",
//     name: "A18-ROC",
//     version: "6153"
// });
//DEBUG:END

//DEBUG:START
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
module.exports = crtler;