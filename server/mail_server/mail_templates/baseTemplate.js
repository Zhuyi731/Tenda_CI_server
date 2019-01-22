const fs = require("fs");
const serverIP = require("../../config/basic_config").httpConfig.ip;
class BaseTemplate {
    constructor() {
        this.serverIP = serverIP;
        this.template = null;
        this.errorMes = {};
    }

    creatTemplate(errorMes) {}

    getTemplateContent(where) {
        return fs.readFileSync(where, "utf-8");
    }

    fillTemplate() {}
}

module.exports = BaseTemplate;