
const express = require('express');
const path = require("path");
const router = express.Router();
const dbModel = require("../../../datebase_mysql/dbModel");
const app = new express();


// 获取登录页面
app.get('/', function(req, res){
    console.log("get login返回页面");
    res.sendFile(path.join(__dirname, "../../../web/dist/login.html"));
});

// 用户登录验证
app.post('/', function(req, res){
    
    //console.log(req);
    findUser(req.body.name);

    function findUser(name) {
        
        return  new Promise((resolve,reject)=>{ 
                
            dbModel.tableModels.User
                .findOne({
                    where:{
                        name: {
                            "$eq": `${name}`
                        }
                    }
                })
                .then(value => {
                    console.log('查询数据库返回数据');
                    //console.log(value );
                    if(value != undefined  && (value.dataValues.password == null || req.body.password == value.dataValues.password)){
                        req.session.userName = req.body.name; // 登录成功，设置 session
                        console.log('设置session');
                        console.log(req.session);
                        console.log("登录成功");
                        res.redirect('/');
                        //res.json({ retCode : '0'});
                    }
                    else{
                        console.log("登录失败");
                        res.json({retCode : '1', retMsg : '账号或密码错误 账号为中文姓名，密码为拼音字母'});// 若登录失败，重定向到登录页面
                    }
                })
                .catch(err => {
                    console.log(err);
                });
            }); 
    };
});

// 退出
app.post('/logout', function (req, res) {
    req.session.userName = null; // 删除session
    res.redirect('/');
});

module.exports = app;