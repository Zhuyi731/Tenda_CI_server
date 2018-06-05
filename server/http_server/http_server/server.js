const express = require("express");
const app = express();
const router = express.Router();
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const path = require("path");
const debug = require("./controller/con_CI");

//引入数据库
const db = require("../datebase_mysql/db");

//处理/api/CI/**请求
const CIRouter = require("./api/api_CI");

app.set("views", path.join(__dirname, "../web/dist"));
app.set("view engine", "html");

//解析post
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

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
app.use("/api/CI",CIRouter);


//主页请求
app.get("/", (req, res) => {
    res.sendPage("index.html");
});

//使用morgan的日志功能
app.use(morgan('dev'));

//使用静态资源管理插件

//处理404错误
//如果走到这一步了，说明上述所有请求都没有拦截
//检测是否为api接口 不是则返回404页面
app.use((req, res, next) => {
    //检查是否请求的静态资源
    if (!/api/g.test(req.originalUrl)) {
        res.sendPage("not_found.html");
    } else {
        //不是则正常进行
        next();
    }
});

var server = app.listen(3000, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log("App is listening at http://%s:%s", host, port);
});