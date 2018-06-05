
const mailConfig = {
    //公司的smtp服务器domain
    host: "smtp.tenda.cn",
    //是否使用SSL接入   使用后会接不上
    secure: false,
    //公司的smtp端口
    port: 25,
    auth: {
        user: "CITest@tenda.cn",
        //smtp授权码
        pass: "Tenda1234567"
    },
    //发送人
    postUser :"CI <CITest@tenda.cn>"
}


module.exports = mailConfig;