process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const nodemailer = require("nodemailer");
const mailConfig = require("../config/mail_config");
const { managers } = require("../config/basic_config");
const from = mailConfig.postUser;


/**
 * 使用node-mailer来进行邮件发送  
 * @DOCUMENT: http://www.nodemailer.com/
 */
class MailSender {
    constructor() {
        delete mailConfig.postUser;
        this.mailer = nodemailer.createTransport(mailConfig);
        this.failedTimes = 0;
        this.sendMail = this.sendMail.bind(this);
        this.templates = {
            error: require("./mail_templates/error_template/index")
        };
    }

    /**
     * 当检测到编译失败的情况给对应的users发送错误邮件
     * @param {*需要发送的人} to @type Array  会自动处理成string
     * @param {*邮件主题}  subject
     * @param {*邮件正文}  message
     * @param {*附件}    @type Array attachments
     */
    sendMail({ to, copyTo, subject, message, attachments }) {
        return new Promise((resolve, reject) => {
            copyTo = Array.from(new Set([...copyTo, ...managers]));
            let tos = mapMembers(to),
                copyTos = mapMembers(copyTo);

            let options = {
                from: from,
                cc: copyTos,
                to: tos,
                subject: subject,
                text: message
            };

            !!attachments && (options.attachments = attachments);

            this.mailer.sendMail(options, err => {
                if (err) {
                    reject(err);
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
     * 用于记录错误信息
     * @param {*错误信息} err 
     */
    recordErrorInfo(err) {
        console.log(err);
    }

    /**
     * 
     * @param {*to} 邮件发送成员 
     */
    mailWithTemplate({ to, copyTo, subject, attachments, template, templateOptions }) {
        return new Promise((resolve, reject) => {
            copyTo = Array.from(new Set([...copyTo, ...managers]));
            let tos = mapMembers(to),
                copyTos = mapMembers(copyTo);

            let options = {
                from: from,
                cc: copyTos,
                to: tos,
                subject: subject,
                html: this.templates[template].creatTemplate(templateOptions)
            };

            !!attachments && (options.attachments = attachments);

            this.mailer.sendMail(options, err => {
                if (err) {
                    reject(err);
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

}

// let mailer = new MailSender();
// mailer.mailWithTemplate({
//     to: ["zhuyi"],
//     copyTo: [],
//     subject: "CI测试",
//     template: "error",
//     templateOptions: {
//         htmlErrors: 12,
//         cssErrors: 32,
//         jsErrors: 33,
//         src: "https://xxxxx",
//         projectName: "A18"
//     }
// });

module.exports = MailSender;