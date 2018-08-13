/**
 * @author zhuyi
 * @desc 用于配置邮箱的相关信息
 * @license MIT license
 * @Version V1.0.0
 * @last modify 2018.8.2
 */

const mailConfig = {
    //公司的smtp代理服务器domain
    //如果服务器电脑设置了静态IP,需要将DNS也设置为公司相应的DNS，否则会解析不到这个domain
    host: "smtp.tenda.cn",
    //是否使用SSL接入   使用后会接不上
    secure: false,
    //公司的smtp端口
    port: 25,
    auth: {
        //CI邮箱号
        user: "CITest@tenda.cn",
        //smtp授权码
        pass: "Tenda1234567"
    },
    //发送人 名字
    postUser :"CI集成服务器 <CITest@tenda.cn>"
}


module.exports = mailConfig;