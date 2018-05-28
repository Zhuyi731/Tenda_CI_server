process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const nodemailer = require("nodemailer");
const mailConfig = require("../config/mail_config");
const from = mailConfig.postUser;
delete mailConfig[postUser];

class MailSender {
    constructor() {
        this.mailer = nodemailer.createTransport(mailConfig);
    }

    /**
     * 当检测到编译失败的情况给对应的users发送错误邮件
     * @param
     */
    sendFailMail(to, message,attachments) {
        let options = {
            from: from,
            to: to,
            subject: "CI集成错误报告",
            text: message,
            attachments: [{
                filename: "附件测试",
                content: "xxxxx"
            }]
        }
    }


}

var mailOptions = {
    from: "zhuyi zhuyi@tenda.cn",
    to: "zhuyi zhuyi@tenda.cn",
    subject: "UI组服务器测试",
    text: "asdasd",
    html: "<b>hello</b>",
    attachments: [{
        filename: "附件测试",
        content: "xxxxx"
    }]
};



transport.sendMail(mailOptions, function (err, res) {
    if (err) console.log(err);
    else console.log(`错误:${response}`);
});


function sendMail(toList, options) {


}

module.exports = sendMail;