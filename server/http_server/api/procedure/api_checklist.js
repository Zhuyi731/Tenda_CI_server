

const express = require("express");
const router = express.Router();
const path = require("path");
const Checklist_con = require("../../controller/procedure/con_checklist");
const multer = require("multer");

/**
 * 请求对应的在CI_con中的操作
 */
const ACTIONS_MAP = {
    "/setProcedure":"setProcedure",
   "/getHandleList":"getHandleList",
   "/handleProcedure":"handleProcedure",
   "/handleSubmit":"handleSubmit",
   "/getAllMembers":"getAllMembers"
};
let prop;
/**
 * 匹配   /api/CI/** 下的请求
 * 请求对应的处理为ACTIONS_MAP中的函数;
 */
for (prop in ACTIONS_MAP) {
    let closure_prop = prop;
    router.post(prop, (req, res) => {
        req.body.userName = req.session.userName ;
        req.body.userMail = req.session.userMail ;
        Checklist_con[ACTIONS_MAP[closure_prop]](req.body)
            .then(data => {
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
    });
}
/**
 * 返回登陆用户
 */

router.get("/getSession", (req, res) => {
    return res.json({name:req.session.userName});
});

module.exports = router;