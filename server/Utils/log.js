const db = require("../../datebase_mysql/db.js");

class Log{
    constructor(){
        
    }

    log(event,message,user,cb){
        db.query(`INSERT systemlog values(0,${event},${message},${user})`,(err,res)=>{
            if(err){
                console.log("日志写入数据库错误");
            }
        });        
    }
};

module.exports = new Log();

