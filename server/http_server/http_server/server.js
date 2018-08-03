const express = require("express");
const app = express();
const router = express.Router();
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const http_config = require("../config/basic_config").http_config;
const notifier = require("./auto_test_server/notifier");
//处理/api/CI/**请求
const CIRouter = require("./api/api_CI");
const CompileRouter = require("./api/api_compile");
const OemRouter = require("./api/api_oem");

app.set("views", path.join(__dirname, "../web/dist"));
app.set("view engine", "html");

//解析session
app.use(session({
    secret:"this is a secret",
    cookie: { maxAge: 60000 }
}));

//解析post
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
//用于cookie解析
app.use(cookieParser());

//将web_ui设置为静态资源目录
app.use(express.static(path.join(__dirname, '../web/dist')));

//写入sendPage方法
app.use((req, res, next) => {
    res.sendPage = (page) => {
        res.sendFile(path.join(__dirname, "../web/dist") + "\\" + page);
    };
    next();
});

//使用各模块路由
app.use("/api/CI", CIRouter);
app.use("/api/compile",CompileRouter);
app.use("/api/oem",OemRouter);

//主页请求
app.get("/", (req, res) => {
    res.sendPage("index.html");
});

//使用morgan的日志功能
app.use(morgan('dev'));

//使用静态资源管理插件

//TODO:   暂时没有做404页面，留给后人来搞   
//处理404错误
//如果走到这一步了，说明上述所有请求都没有拦截
//检测是否为api接口 不是则返回404页面
// app.use((req, res, next) => {
//     //检查是否请求的静态资源
//     if (!/api/g.test(req.originalUrl)) {
//         res.sendPage("not_found.html");
//     } else {
//         //不是则正常进行
//         next();
//     }
// });

var server = app.listen(http_config.port, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log("App is listening at http://%s:%s", host, port);
});
//开启自动检测
notifier.run();