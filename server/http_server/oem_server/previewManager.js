const oemConfig = require("../../config/basic_config").oemConfig;
const path = require("path");
const fs = require("fs");
const util = require("../Util/util");

class PreviewManager {

    constructor() {
        this.previews = [];
        //超过半小时没有再次预览的话，杀死web-debug和http进程
        this.killTime = 30 * 60 * 1000;
    }

    /**压入一个项目预览实例 */
    push(preview) {
        this.previews.push(preview);
        //一个小时后，当前项目的进程会被删除
        let preName = preview.name;
        preview.timer = setTimeout(() => {
            let index = this.getPreviewIndex(preName);
            this.killPreview(this.previews[index]);
            this.previews.splice(index, 1);
        }, this.killTime);
    }

    getPreviewIndex(name) {
        let i,
            len = this.previews.length;
        for (i = 0; i < len; i++) {
            if (this.previews[i].name == name) {
                return i;
            }
        }
        return -1;
    }

    getPreview(name) {
        let index = this.getPreviewIndex(name);
        if (index == -1) {
            return null;
        } else {
            return this.previews[index];
        }
    }
    /**
     * 杀死当前项目的子进程
     * @param {*项目名} name 
     */
    killPreview(preview) {
        //首先杀死http子进程
        let webPid = fs.readFileSync(preview.pidPath, "utf-8").split("\r\n")[0];
        process.kill(webPid, "SIGTERM");
        //再杀死web-debug子进程
        process.kill(preview.pid, "SIGTERM");
    }
    /**
     * 刷新当前项目的定时器
     */
    refresh(name) {
        let p = this.getPreview(name);
        clearTimeout(p.timer);
        p.timer = setTimeout(() => {
            let index = this.getPreviewIndex(name);
            this.killPreview(this.previews[index]);
            this.previews.splice(index, 1);
        }, this.killTime);
    }

    /**
     * 每天固定时间，清除所有preview及其下载的代码
     */
    deleteAll() {
        util.rmdirSync(oemConfig.root);
    }

}

let manager = new PreviewManager();
manager.deleteAll();
module.exports = manager;