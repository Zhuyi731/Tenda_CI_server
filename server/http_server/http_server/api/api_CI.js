const express = require("express");
const router = express.Router();
const path = require("path");
const CI_con = require("../controller/con_CI");

/**
 * 请求对应的在CI_con中的操作
 */
const ACTIONS_MAP = {
    "/getProLine": "getAllLine",
    "/setNewPro": "newProLine",
    "/getAllProducts": "getAllProducts",
    "/editProduct": "editProduct",
    "/getCompileProducts": "getCompileProducts"
};
let prop;
/**
 * 匹配   /api/CI/** 下的请求
 * 请求对应的处理为ACTIONS_MAP中的函数;
 */
for (prop in ACTIONS_MAP) {
    let closure_prop = prop;
    router.post(prop, (req, res) => {
        CI_con[ACTIONS_MAP[closure_prop]](req.body).then(data => {
            res.json(data)
        }).catch(err => {
            res.json(err);
        })
    });
}

module.exports = router;