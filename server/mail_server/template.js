process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const nodemailer = require("nodemailer");
const mailConfig = require("../config/mail_config");
const from = mailConfig.postUser;
delete mailConfig.postUser;
const mjml2html = require('mjml');
const path = require("path");

/*
  Compile an mjml string
*/
const htmlOutput = mjml2html(require("./mail_templates/happyNewYear").html);
class Template {
    constructor() {
        this.mailer = nodemailer.createTransport(mailConfig);
    }

    creatTemplate() {
        this.mailer.sendMail({
            from: from,
            to: "zhuyi@tenda.cn",
            subject: "测试邮件",
            html: htmlOutput.html,
            attachments: [{
                filename: "pig.jpg",
                path: path.join(__dirname, "./resourcecs/pig.jpg"),
                cid: "01"
            }]
        }, err => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Send mail success`);
            }
        });
    }
}
const template = new Template();
template.creatTemplate();