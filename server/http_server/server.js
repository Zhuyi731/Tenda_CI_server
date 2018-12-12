//Dependencies
const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

//Custom requirements
const notifier = require("./Notifier");
const dbModal = require("../datebase_mysql/dbModal");

//引入各级路由
const CIRouter = require("./api/api_CI");
const CompileRouter = require("./api/api_compile");
const OemRouter = require("./api/api_oem");

//配置项
const basicConfig = require("../config/basic_config");
const httpConfig = basicConfig.httpConfig;

class HttpServer {
    constructor() {
        //express实例
        this.app = null;
        //server实例
        this.server = null;
    }

    init() {
        this.app = new express();
        //引入中间件
        this.useMiddleWares();
        //引入路由
        this.useRouters();
        //开启http服务
        this.startHttpServer();
        //创建CI储存的文件夹和OEM储存文件夹
        this.creatRootFolders();
        //开启CI服务
        this.startCI();
    }

    useMiddleWares() {
        const app = this.app;
        app.set("views", path.join(__dirname, "../web/dist"));
        app.set("view engine", "html");
        //解析session
        app.use(session({
            secret: "this is a secret",
            cookie: {
                maxAge: 60000
            }
        }));

        //解析post
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: false
        }));
        //用于cookie解析
        app.use(cookieParser());

        //使用morgan的日志功能
        app.use(morgan('dev'));
        //将web_ui设置为静态资源目录
        app.use(express.static(path.join(__dirname, '../web/dist')));
    }

    useRouters() {
        const app = this.app;
        //使用各模块路由
        app.use("/api/CI", CIRouter);
        app.use("/api/compile", CompileRouter);
        app.use("/api/oem", OemRouter);

        //主页请求
        app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "../web/dist/index.html"));
        });
    }

    startHttpServer() {
        this.server = this.app.listen(httpConfig.port, () => {
            console.log(`CI server is listening at http://localhost:${this.server.address().port}`);
        });
    }

    creatRootFolders() {
        try {
            fs.mkdirSync(basicConfig.svnConfig.root);
            fs.mkdirSync(basicConfig.oemConfig.root);
        } catch (e) {

        }
    }

    startCI() {
        dbModal.init()
            .then(() => {
                //开启自动检测
                notifier.run();
            });
    }
}

let httpServer = new HttpServer();
httpServer.init();