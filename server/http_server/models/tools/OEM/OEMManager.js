const OEMProduct = require("./OEMProduct");

class OEMManager {
    constructor() {
        //用于储存现有的OEM项目实例
        this.OEMs = [];
    }

    creatOEMEntity(options) {
        return new Promise((resolve, reject) => {
            //先检查一下是不是已经存在这个OEM项目了
            let OEMEntity = this.getOEMEntity(options.name);
            //如果已经存在并且配置一样  则直接使用旧的目录
            if (!OEMEntity) {
                OEMEntity = new OEMProduct();
                this.OEMs.push(OEMEntity);
            }

            OEMEntity
                .update(options)
                .then(() => {
                    resolve(OEMEntity);
                })
                .catch(reject);
        });
    }

    getOEMEntity(name) {
        return this.OEMs.find(el => (el.name == name));
    }

    preview(name, isWebpackProject) {
        return new Promise((resolve, reject) => {
            this.getOEMEntity(name)
                .preview(isWebpackProject)
                .then(resolve)
                .catch(reject);
        });
    }


    killOEM() {

    }
}
module.exports = new OEMManager();