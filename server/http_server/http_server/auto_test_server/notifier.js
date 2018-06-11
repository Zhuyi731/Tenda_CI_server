const path = require("path");
var checkTime = require("../../config/basic_config").checkTime;
const db = require("../../datebase_mysql/db");
const productManager = require("./productManager");

//DEBUG:
checkTime = 17;

/**
 * Notify类
 * Notify用于在夜间唤醒product实例并进行检查
 */
class Notify {
    constructor() {
        this.first = true;
        this.svnCtTimes = 0;
    }

    run() {
        let d = new Date(),
            time = d.getHours(),
            min = d.getMinutes(),
            month = d.getMonth(),
            day = d.getDay();

        if (this.first) {
            this.first = false;
            productManager.checkDBInProduct(productManager);
        }
        /**
         * 每隔一个小时就来检查一次
         * 如果检查时间在设置的时间点则开始唤醒
         */
        console.log(`${month}.${day}号 ${time}:${min}  进入Notify.run()`);
        setTimeout(() => {
            this.run();
        }, 60 * 60 * 1000);

        if (time == checkTime) {
            console.log(`${month}.${day}号 ${time}:${min}  日常检查`);
            this.notifyAllProduct();
        }
    }

    /**
     * 遍历还在运行的产品
     * 检查每个在运行的产品
     */
    /**
     * 进行一次双向检查
     * 1.检查在数据库中，但是没有在产品中的情况，生成新的产品然后加入之
     * 2.检查在产品中，但是没有在数据库中的情况，删除这个产品
     * 以数据库为准
     * 
     * 做了这两个检查后 就保证了每个产品自身的状态已经是最新的了
     * checkProductInDB调用了每个产品的updatestatus方法
     */
    notifyAllProduct() {
        let that = this;
        productManager.checkProductInDB(productManager)
            .then(productManager.checkDBInProduct)
            .then(productManager.runProductOnRunning)
            .catch(err => {
                if (err.errMessage == 'SVN服务器连接超时' && that.svnCtTimes < 3) {
                    that.svnCtTimes++;
                    console.log(`SVN服务器链接超时，半小时后尝试第${that.svnCtTimes}次重新连接`);
                    setTimeout(that.notifyAllProduct, 30 * 60 * 1000);
                } else {
                    that.svnCtTimes = 0;
                }
                console.log(err)
            });
    }





}
const notifier = new Notify();

// //DEBUG:
// notifier.run();
module.exports = notifier;