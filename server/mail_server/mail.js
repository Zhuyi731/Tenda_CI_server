process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const nodemailer = require("nodemailer");
const mailConfig = require("../config/mail_config");
const { managers } = require("../config/basic_config");
const from = mailConfig.postUser;
const fs = require("fs");
const path = require("path");

/**
 * 使用node-mailer来进行邮件发送  
 * @DOCUMENT: http://www.nodemailer.com/
 */
class Mailer {
    constructor() {
        delete mailConfig.postUser;
        this.mailer = nodemailer.createTransport(mailConfig);
        this.failedTimes = 0;
        this.sendMail = this.sendMail.bind(this);
        this.templates = {
            error: require("./mail_templates/error_template/index"),
            noUpdate: require("./mail_templates/no_update_template/index"),
            dailyReport: require("./mail_templates/daily_report_template/index"),
            checklist:require("./mail_templates/checklist_templates/index")
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
     * @param {*copyTo} 抄送
     * @param {*subject} 邮件标题
     * @param {*attachments} 附件  格式<Array><{path,filename}> 
     * @param {*template} 模板
     * @param {*templateOptions} 模板配置项
     */
    mailWithTemplate({ to, copyTo, subject, attachments, template, templateOptions }) {
        return new Promise((resolve, reject) => {
            // copyTo = Array.from(new Set([...copyTo, ...managers]));
            this.templates[template]
                .creatTemplate(templateOptions)
                .then(html => {
                    let options = {
                        from,
                        to: to.map(member => member.concat("@tenda.cn")),
                        cc: copyTo.map(member => member.concat("@tenda.cn")),
                        subject,
                        attachments,
                        html
                    };

                    this.mailer.sendMail(options, err => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                            console.log(`Send mail to ${to}, copy to ${copyTo} success`);
                        }
                    });
                })
                .catch(reject);
        });
    }
}

// let aa = fs.readFileSync(path.join(__dirname, "../resource/new_year/newyear.webp")).toString("base64");

// let mailer = new Mailer();
// mailer.mailWithTemplate({
//     to: ["zhuyi"],
//     copyTo: [],
//     subject: "日报(Beta-测试版)",
//     template: "dailyReport",
//     templateOptions: {}
// });

module.exports = Mailer;