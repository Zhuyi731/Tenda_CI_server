process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const nodemailer = require("nodemailer");

let transport = nodemailer.createTransport({
    host: "smtp.tenda.cn",
    secure: true,
    port: 465,
    auth: {
        user: "zhuyi",
        pass: "Nevergiveup0"
    }
});

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