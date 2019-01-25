const BaseTemplate = require("../baseTemplate");
const path = require("path");
const fs = require("fs");
const serverIP = require("../../../config/basic_config").httpConfig.ip;

class ErrorTemplate extends BaseTemplate {
    constructor() {
        super(...arguments);
        this.serverIP = serverIP;

        this.helloPool = {
            hi: "Hi",
            hello: "Hello",
            haha: "哈哈哈哈,我又回来了",
            dididi: "滴滴滴"
        };
        this.helloPool2 = {
            everbody: "everthing seems fine",
            everbodyCn: "大家好",
            morning: "大家早上好"
        };
        this.dayToEnglish = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturdaty", "sunday"];
    }

    creatTemplate(errorMes) {
        this.errorMes = errorMes;
        this.content = this.getTemplateContent(path.join(__dirname, "./template.html"));
        this.fillTemplate();
        return this.content;
    }

    fillTemplate() {
        let template = this.creatDailyReport();
        this.content = this.content.replace(/{{template}}/, template);
    }

    creatDailyReport() {
        let chatTemplate = `
            ${this._helloTemplate()}
            ${this._helloImgTemplate()}
        `;

        return chatTemplate;
    }

    /**
     * 打招呼模板
     */
    _helloTemplate() {
        let hello,
            body,
            helloIndex,
            bodyIndex,
            template;

        hello = Object.keys(this.helloPool);
        body = Object.keys(this.helloPool2);
        helloIndex = this._fairRandom(hello.length - 1);
        bodyIndex = this._fairRandom(body.length - 1);

        template = `${this.helloPool[hello[helloIndex]]}, ${this.helloPool2[body[bodyIndex]]}`;

        return this._textTemplate(`${template}`);
    }

    _helloImgTemplate() {
        let now = new Date(),
            day = now.getDay(),
            englishDay = this.dayToEnglish[day - 1],
            localImgFilePath = `../../../resource/${englishDay}`,
            imgFilePath = `http://${this.serverIP}/resource/${englishDay}`; //该路径是文件夹

        let shouldEggs = this._fairRandom(100) < 8;
        if (shouldEggs) {
            localImgFilePath = "../../../resource/dailyEggs";
            imgFilePath = `http://${this.serverIP}/resource/dailyEggs`;
        }

        //获取路径下的随机数据
        try {
            let imgs = fs.readdirSync(path.join(__dirname, localImgFilePath)),
                selected = this._fairRandom(imgs.length - 1);

            imgFilePath += `/${imgs[selected]}`;
        } catch (e) {
            console.log(e);
        }

        return this._imgTemplate(imgFilePath);
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
            <div class="portrait">CI</div>
            <div class="message mes-img">
                <img class="inner-img" src="${src}"/>
            </div>`;

        return template;
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

let errorTemplate = new ErrorTemplate();
errorTemplate.creatDailyReport();

module.exports = new ErrorTemplate();