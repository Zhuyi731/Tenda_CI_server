const BaseTemplate = require("../baseTemplate");
const path = require("path");
const fs = require("fs");
const serverIP = require("../../../config/basic_config").httpConfig.ip;
const dbModel = require("../../../datebase_mysql/dbModel");
const festival = require("./festival");

class ErrorTemplate extends BaseTemplate {
    constructor() {
        super(...arguments);
        this.serverIP = serverIP;

        this.egged = false;

        this.now = new Date();
        this.day = this.now.getDay();
        this.month = this.now.getMonth() + 1;
        this.year = this.now.getFullYear();
        this.date = this.now.getDate();

        this.dayPerMonth = [31, 28 + this.isLeapYear(), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        this.dayToEnglish = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    }

    /**
     * 是否为闰年  是  1  否0
     */
    isLeapYear() {
        let year = this.year;
        return year % 4 == 0 ? (year % 100 != 0 ? 1 : (year % 400 == 0 ? 1 : 0)) : 0;
    }

    creatTemplate(errorMes) {
        return new Promise((resolve, reject) => {
            this.errorMes = errorMes;
            this.content = this.getTemplateContent(path.join(__dirname, "./template.html"));
            this.creatDailyReport()
                .then(() => {
                    resolve(this.content);
                })
                .catch(reject);
        });
    }

    creatDailyReport() {
        return new Promise((resolve, reject) => {
            let chatTemplate = "";
            chatTemplate += this._helloTemplate();
            chatTemplate += this._timeTemplate();
            chatTemplate += this._helloImgTemplate();
            chatTemplate += this._remindTemplate();
            chatTemplate += this._textTemplate(`下面是今天CI检查情况总览`);
            this._checkTemplate()
                .then(checkTemplate => {
                    chatTemplate += checkTemplate;
                    this.content = this.content.replace(/{{chatTemplate}}/, chatTemplate);
                    resolve();
                })
                .catch(reject);
        });
    }

    _checkTemplate() {
        return new Promise((resolve, reject) => {
            dbModel.tableModels.CheckRecord
                .findAll({
                    where: {
                        time: {
                            "$eq": `${this.year}-${this.month}-${this.date}`
                        }
                    }
                })
                .then(results => {
                    let i = 0,
                        template = "";

                    while (i < 9) {
                        if (i >= results.length) {
                            template += this._errorSquareTemplate("", "");
                        } else {
                            let result = results[i];
                            if (result.isUpdated) {
                                template += this._errorSquareTemplate(result.product, this._errorTemplate(result.dataValues));
                            } else {
                                template += this._errorSquareTemplate(result.product, `项目没有代码更新`);
                            }
                        }
                        i++;
                    }
                    resolve(template);
                })
                .catch(reject);
        });
    }

    /**
     * 打招呼模板
     */
    _helloTemplate() {
        return this._textTemplate(`大家早上好`);
    }

    _timeTemplate() {
        let festivalInfo = festival.getFestival(2019, 2, 19),
            lunarDay = `${festivalInfo.IMonthCn}${festivalInfo.IDayCn}`,
            festivalDay = festivalInfo.lunarFestival || festivalInfo.solarFesival;

        return this._textTemplate(`今天是${festivalInfo.cYear}年${festivalInfo.cMonth}月${festivalInfo.cDay}日，农历${lunarDay}。${!!festivalDay?"今天是"+festivalDay:""}`);
    }

    _helloImgTemplate() {
        let englishDay = this.dayToEnglish[this.day - 1],
            localImgFilePath = `../../../resource/${englishDay}`,
            imgFilePath = `http://${this.serverIP}/resource/${englishDay}`,
            template; //该路径是文件夹

        let shouldEgg = this._fairRandom(100) < 8;
        this.egged = shouldEgg;
        if (shouldEgg) {
            localImgFilePath = "../../../resource/dailyEggs";
            imgFilePath = `http://${this.serverIP}/resource/dailyEggs`;
        }

        //获取路径下的随机数据
        try {
            let imgs = fs.readdirSync(path.join(__dirname, localImgFilePath)),
                selected = this._fairRandom(imgs.length - 1);

            imgFilePath += `/${imgs[selected]}`;
            localImgFilePath += `/${imgs[selected]}`;
            // imgFilePath = fs.readFileSync(path.join(__dirname, localImgFilePath)).toString("base64");

            template = this._imgTemplate(imgFilePath);
            shouldEgg && (template += ("不周了，反正你们也知道今天周几"));
            return template;
        } catch (e) {
            console.log(e);
            return "";
        }
    }

    _remindTemplate() {
        let template = "";
        switch (this.day) {
            case 1:
                {
                    let messages = ["今天又是新的一周，大家也要元气满满哦!", "一日之计在于晨，一周之计在于..."];
                    template += this._textTemplate(messages[this._fairRandom(messages.length)]);
                }
                break;
            case 2:
                {

                }
                break;
            case 3:
                {

                }
                break;
            case 4:
                {

                }
                break;
            case 5:
                {
                    template += this._textTemplate(`大家记得<a href="http://plm.tenda.cn:7001/Agile/default/login-cms.jsp">填写工时<a>。不必等到下午再填写`);
                }
                break;
            case 6:
                {

                }
                break;
            case 7:
                {

                }
                break;
        }
        return template;
    }

    _textTemplate(message) {
        let template = `<div class="message-box">
            <div class="portrait">CI</div>
            <div class="message mes-text">${message}</div>
        </div>`;

        return template;
    }

    _imgTemplate(src) {
        let template = `
            <div class="message-box">
                <div class="portrait">CI</div>
                <div class="message mes-img">
                    <img class="inner-img" src="${src}"/>
                </div>
            </div>`;

        return template;
    }

    _errorTemplate({ jsErrors, htmlErrors, cssErrors, encodeErrors }) {
        return `
            <p class="errors">HTML错误:${htmlErrors} Problems</p>
            <p class="errors">CSS错误:${cssErrors} Problems</p>
            <p class="errors">JS错误:${jsErrors} Problems</p>
            <p class="errors">编码检查:${encodeErrors} Problems</p>
        `;
    }

    _errorSquareTemplate(title, message) {
        return `
         <div class="card">
            <div class="card-title card2">${title}</div>
            <div class="card-content">
                <div class="errors-wrapper">
                    ${message}
                </div>
            </div>
        </div>`;
    }

    /**
     * 生成[rangeLeft,rangeRight]区间的随机数
     * @param {*} rangeLeft 
     * @param {*} rangeRight 
     */
    _fairRandom(rangeLeft, rangeRight) {
        if (!rangeRight) {
            rangeRight = rangeLeft;
            rangeLeft = 0;
        }
        rangeLeft = ~~rangeLeft;
        rangeRight = ~~rangeRight;

        let len = rangeRight - rangeLeft,
            random = Math.floor(Math.random() * (len + 1));

        return rangeLeft + random;
    }

}

// let errorTemplate = new ErrorTemplate();
// dbModel.init()
//     .then(() => {
//         return errorTemplate.creatTemplate()
//     })
//     .then(template => {
//         fs.writeFileSync(path.join(__dirname, "./test.html"), template, "utf-8");
//         // console.log(template);
//     })
//     .catch(err => {
//         debugger;
//     });

module.exports = new ErrorTemplate();