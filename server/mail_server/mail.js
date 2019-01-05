process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const nodemailer = require("nodemailer");
const mailConfig = require("../config/mail_config");
const from = mailConfig.postUser;
const path = require("path");
delete mailConfig.postUser;

class MailSender {
    constructor() {
        this.mailer = nodemailer.createTransport(mailConfig);
        this.failedTimes = 0;

        this.retry = this.retry.bind(this);
        this.sendMail = this.sendMail.bind(this);
    }

    /**
     * 当检测到编译失败的情况给对应的users发送错误邮件
     * @param {*需要发送的人} to @type Array  会自动处理成string
     * @param {*邮件主题}  subject
     * @param {*邮件正文}  message
     * @param {*附件}    @type Array attachments
     */
    sendMail(to, copyTo, subject, message, attachments) {
        return new Promise((resolve, reject) => {
            let tos = mapMembers(to),
                copyTos = mapMembers(copyTo);

            let options = {
                from: from,
                cc: copyTos,
                to: tos,
                subject: subject,
                text: message
            };

            if (!!attachments) {
                options.attachments = attachments;
            }

            this.mailer.sendMail(options, err => {
                if (err) {
                    this.retry(to, copyTo, subject, message, attachments, err, reject);
                } else {
                    resolve();
                    console.log(`Send mail to ${to}, copy to ${copyTo} success`);
                }
            });

            function mapMembers(arr) {
                return arr.map(member => {
                    return member.concat("@tenda.cn");
                }).join(",");
            }
        });
    }

    /**
     * 当失败时，记录错误信息并且重新尝试发送邮件
     * TODO:将错误信息记录在数据库中
     */
    retry(to, copyTo, subject, message, attachments, err, reject) {
        this.recordErrorInfo(err);

        if (this.failedTimes < 3) {
            console.log("发送邮件失败:" + err);
            console.log(`第${this.failedTimes}次尝试重新发送`)
            setTimeout(() => {
                this.sendFailMail(to, copyTo, subject, message, attachments)
            }, 5000);
            this.failedTimes++;
        } else {
            this.failedTimes = 0;
            reject(err);
        }
    }
    /**
     * 用于记录错误信息
     * @param {*错误信息} err 
     */
    recordErrorInfo(err) {
        console.log(err);
    }

}

// let mailer = new MailSender();

// mailer.sendFailMail(["zhuyi"], ["zhuyi"], "CI测试邮件", "测试邮件，不要回复", [{
//     filename: "mai11l.js",
//     path: path.join(__dirname, "mail.js")
// }]);

module.exports = MailSender;