
const mailConfig = {
    //公司的smtp服务器domain
    host: "smtp.tenda.cn",
    //是否使用SSL接入   使用后会接不上
    secure: false,
    //公司的smtp端口
    port: 25,
    auth: {
        user: "zhuyi@tenda.cn",
        //smtp授权码
        pass: "Nevergiveup0"
    },
    //发送人
    postUser :"zhuyi <zhuyi@tenda.cn>"
}


module.exports = mailConfig;