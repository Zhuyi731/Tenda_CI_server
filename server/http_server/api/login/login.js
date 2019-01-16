
var express = require('express');
var app = express();
var session = require('express-session');
var bodyparser = require('body-parser');
const path = require("path");

// 下面三行设置渲染的引擎模板
app.set('views', path.join(__dirname, "../../../web/dist")); 
app.set('view engine', 'html'); // 设置解析模板文件类型：这里为html文件
//app.engine('html', require('ejs').__express); // 使用ejs引擎解析html文件中ejs语法

app.use(bodyparser.json()); // 使用bodyparder中间件，
app.use(bodyparser.urlencoded({ extended: true }));
// 使用 session 中间件
app.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie : {
        maxAge : 1000 * 60 * 3, // 设置 session 的有效时间，单位毫秒
    },
}));

// 获取登录页面
app.get('/login', function(req, res){
    console.log("返回页面");
    res.sendFile(path.join(__dirname, "../../../web/dist/login.html"));
});

// 用户登录
app.post('/login', function(req, res){
    console.log(req);
    if(req.body.name == 'admin' && req.body.password == '202cb962ac59075b964b07152d234b70'){
        req.session.userName = req.body.name; // 登录成功，设置 session
        console.log("登录成功");
        res.redirect('/');
    }
    else{
        console.log("登录失败");
        res.json({status:'1', retCode : '1', retMsg : '账号或密码错误'});// 若登录失败，重定向到登录页面
    }
});

// 获取主页
app.get('/', function (req, res) {
    if(req.session.userName){  //判断session 状态，如果有效，则返回主页，否则转到登录页面
        res.render('/',{name : req.session.userName});
    }else{
        res.redirect('cgi/login');
    }
})

// 退出
app.get('/logout', function (req, res) {
    req.session.userName = null; // 删除session
    res.redirect('cgi/login');
});
module.exports = app;