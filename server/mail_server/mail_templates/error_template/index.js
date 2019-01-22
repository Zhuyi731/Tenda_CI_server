const BaseTemplate = require("../baseTemplate");
const path = require("path");

class ErrorTemplate extends BaseTemplate {
    constructor() {
        super(...arguments);
    }

    creatTemplate(errorMes) {
        this.errorMes = errorMes;
        this.content = this.getTemplateContent(path.join(__dirname, "./template.html"));
        this.fillTemplate();
        return this.content;
    }

    fillTemplate() {
        let charUrl = this.getStatisticUrl();

        this.content = this.content
            .replace(/{{server-ip}}/g, this.serverIP)
            .replace(/{{project-name}}/, this.errorMes.projectName)
            .replace(/{{svn-src}}/, this.errorMes.src)
            .replace(/{{html-errors}}/, this.errorMes.htmlErrors)
            .replace(/{{css-errors}}/, this.errorMes.cssErrors)
            .replace(/{{js-errors}}/, this.errorMes.jsErrors)
            .replace(/{{excel-repeat}}/, this.errorMes.excelRepeat || "0")
            .replace(/{{code-json}}/, this.errorMes.codeJson || "0")
            .replace(/{{excel-json}}/, this.errorMes.excelJson || "0")
            .replace(/{{statistic}}/, charUrl);
    }

    getStatisticUrl() {
        let prop,
            mes = this.errorMes,
            statistic = {
                chd: `t:${mes.htmlErrors},${mes.cssErrors},${mes.jsErrors}`,
                chdl: "html|css|js",
                chli: `${mes.htmlErrors+mes.cssErrors+mes.jsErrors}`,
                chl: `${mes.htmlErrors}|${mes.cssErrors}|${mes.jsErrors}`,
                chs: "240x240",
                chco: "409EFF,67C23A,FF0000"
            },
            url = "https://image-charts.com/chart?cht=p";

        for (prop in statistic) {
            url += `&${prop}=${statistic[prop]}`;
        }

        return url;
    }
}

module.exports = new ErrorTemplate();