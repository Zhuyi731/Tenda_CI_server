const OEMProduct = require("./OEMProduct");

class OEMManager {
    constructor() {
        //用于储存现有的OEM项目实例
        this.OEMs = [];
        //用于杀死OEM定制项目的定时器
        this.killerTimer = null;
        //每隔5分钟检查一次
        this.killInterval = 0.6 * 60 * 1000;
        //超过20分钟，OEM项目没有被更新或者预览，则杀死进程
        this.killThrolder = 0.6 * 60 * 1000;
        //改变this指向
        this._killOEMs = this._killOEMs.bind(this);
        //调试模式下不需要清除OEM
        !global.debug.oemProduct && this._killOEMs();
    }

    creatOEMEntity(options) {
        return new Promise((resolve, reject) => {
            //先检查一下是不是已经存在这个OEM项目了
            let OEMEntity = this.getOEMEntity(options.name, false);
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

    getOEMEntity(name, required = true) {
        //无论做任何操作都需要更新时间
        let entity = this.OEMs.find(el => (el.name == name));
        if (required && !entity) {
            throw new Error("当前OEM项目已经被服务器删除,请重新创建");
        }
        entity && entity.updateTime();
        return entity;
    }

    preview(name, isWebpackProject) {
        return new Promise((resolve, reject) => {
            this.getOEMEntity(name)
                .preview(isWebpackProject)
                .then(resolve)
                .catch(reject);
        });
    }

    compressProject(name) {
        return new Promise((resolve, reject) => {
            let OEMEntity = this.getOEMEntity(name);
            OEMEntity
                .compress()
                .then(resolve)
                .catch(reject);
        });
    }

    //定时监测所有OEM项目情况
    //超过阈值时间自动删除
    _killOEMs() {
        let i,
            now,
            OEM;

        for (i = 0; i < this.OEMs.length; i++) {
            OEM = this.OEMs[i];
            now = Date.now();
            //如果OEM项目超过阈值没有进行操作，则对项目进行清除
            if (now - OEM.lastUpdatedAt > this.killThrolder) {
                //如果是在预览中，才需要将对应的进程杀死
                if (OEM.previewer.isOnPreviewing) {
                    try {
                        /**
                         * node issues:杀死父进程无法使子进程关闭，子进程会被init进程托管
                         * https://github.com/nodejs/help/issues/1389
                         * 
                         * 杀死子进程，父进程可能会直接down掉
                         * 此时会抛出一个错误
                         */
                        //先杀HTTP子进程
                        OEM.previewer.childPid && process.kill(OEM.previewer.childPid, "SIGTERM");
                        //再杀web-debug进程
                        process.kill(OEM.previewer.pid, "SIGTERM");
                    } catch (e) {
                        if (e.code !== "") {
                            console.log(`[OEM Error]:尝试杀死${OEM.name}预览进程时出错`);
                            console.log(e);
                        }
                    }
                }
                //然后清除OEM下拉到本地的文件
                OEM.clean();
                //最后，从OEM Manager中清除项目实例
                this.OEMs.splice(i--, 1);
            }
        }
        this.killerTimer = setTimeout(this._killOEMs, this.killInterval);
    }
}
module.exports = new OEMManager();