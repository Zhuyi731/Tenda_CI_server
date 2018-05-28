const proPath = "http://192.168.100.233:18080/svn/GNEUI/SourceCodes/Trunk/GNEUIv1.0/O3v2_temp";

const {
    svnConfig
} = require("../config/basic_config");

const {
    spawn
} = require("child_process");

class SVN {
    constructor(config) {
        this.svnConfig = svnConfig;
        this.projectConfig = config;
        this.co = this.checkout;
    }

    checkout(callback) {
        let sp = spawn("svn", ["co", this.projectConfig.path, this.svnConfig.local, "--username", this.svnConfig.user, "--password", this.svnConfig.pass], {
            encoding: 'utf-8'
        });

        sp.on("err",(err)=>{
            console.log("执行svn checkout时进程错误");
            console.log(err);
        });

        //
        sp.stdout.on("data", (data) => {
            console.log(data.toString("utf-8"));
        });

        sp.stdout.on("close", () => {
            console.log("SVN checkout完毕");
            !!callback && callback.call();
        });
    }
   
    hasUpdated(){
        let sp = spawn('svn',["log","-l","1",this.projectConfig.path]);

        sp.stdout.on("data", (data) => {
            let time = data.toString("utf-8").split("|")[2].split("(")[0];
            //获取时间戳
            time = new Date(time).getTime();
            //如果在上次检查后更新了代码，则返回true
            if(time > this.projectConfig.lastCheckTime){
                return true;
            }else{
                return false;
            }

        });
    }

    command(options) {
        let commander = options.commander,
            args = options.args,
            opt = options.options;
    }

};

let svn = new SVN({
    path:proPath,
    interval:3*60*60,
    lastCheckTime:new Data().getTime(),
});

svn.hasUpdated();

module.exports = SVN;