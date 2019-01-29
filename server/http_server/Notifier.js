const { ciConfig } = require("../config/basic_config");
const productManager = require("./models/CI/productManager");
const dbModel = require("../datebase_mysql/dbModel");
const dbModal = require("../datebase_mysql/dbModel");
const mailer = require("../mail_server/mail");
/**
 * Notify类
 * Notify用于在夜间唤醒product实例并进行检查
 * 以及在夜间删除当天的OEM定制项目
 */
class Notifier {
    constructor() {
        this.svnCtTimes = 0;
        this.runningTimer = null;
        this.run = this.run.bind(this);
        this.notifyAllProduct = this.notifyAllProduct.bind(this);
    }

    run() {
        let now = new Date(),
            hour = now.getHours(),
            min = now.getMinutes(),
            month = now.getMonth(),
            day = now.getDate();
        /**
         * 保持db的唤醒状态  来避免一个数据库断开连接无法自动连接的情况
         * 1小时唤醒1次
         */
        dbModal.tableModels.User.findAll();

        /**
         * 每隔一个小时就来检查一次
         * 如果检查时间在设置的时间点则开始唤醒
         */
        console.log(`Current Time:${month+1}.${day}号 ${hour}:${min}`);
        this.runningTimer = setTimeout(this.run, 60 * 60 * 1000);

        if (hour == ciConfig.CHECK_TIME || global.debug.notifier) {
            console.log(`${month+1}.${day}号 ${hour}:${min}  日常检查`);
            !global.debug.shouldCloseCICheck && this.notifyAllProduct();
        }
    }

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
        productManager
            .doubleCheck()
            .then(productManager.runProductOnRunning)
            .then(this.sendDailyReport)
            .catch(err => {
                if (err.errMessage == 'SVN服务器连接超时') {
                    if (this.svnCtTimes < 3) {
                        this.svnCtTimes++;
                        console.log(`SVN服务器链接超时，半小时后尝试第${this.svnCtTimes}次重新连接`);
                        setTimeout(this.notifyAllProduct, 30 * 60 * 1000);
                    } else {
                        this.svnCtTimes = 0;
                    }
                }
                console.log(err);
            });
    }

    sendDailyReport() {
        return new Promise((resolve, reject) => {
            dbModel.tableModels.User
                .findAll()
                .then(users => {
                    return mailer.mailWithTemplate({
                        to: users.map(usr => usr.mail),
                        cc: [],
                        subject: "CI 日报",
                        template: "dailyReport",
                        templateOptions: {}
                    });
                })
                .then(resolve)
                .catch(reject);
        });
    }
}

module.exports = new Notifier();