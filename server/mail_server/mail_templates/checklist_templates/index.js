const BaseTemplate = require("../baseTemplate");
const path = require("path");

class ChecklistTemplate extends BaseTemplate{
    constructor(){
        super(...arguments);
        
    }
    creatTemplate(msg){
        return new Promise((resolve,reject)=>{
            this.msg = msg;
            this.content = this.getTemplateContent(path.join(__dirname, "./template.html"));
            this.fillTemplate();
            resolve(this.content);
        });
    }
    fillTemplate(){
        this.content = this.content
        .replace(/{{content}}/g, this.msg.msg)
        .replace(/{{project-name}}/g, this.msg.name)
        .replace(/ {{project-response}}/g, this.msg.response)
    }
}

module.exports = new ChecklistTemplate();