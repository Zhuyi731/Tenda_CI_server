/**
 * @author zhuyi
 * @desc 此文件所在层级位于服务器API层，用于承接Controller层以及View层的数据通信。
 * API层匹配到请求后交给Controller层进行逻辑处理。处理完后返回信息即可。再由API层返回给页面
 * API层存在的目的是为了处理数据。Controller层最好不要处理数据，只关注逻辑
 * @license MIT license
 * @Version V1.0.0
 * @title CI集成配置请求匹配
 */

const express = require("express");
const router = express.Router();
const path = require("path");
const CI_con = require("../controller/con_CI");
const multer = require("multer");
const basicConfig = require("../../config/basic_config").svnConfig;

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

let upload =multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(basicConfig, req.params.productName));
        },
        filename: "lang.xlsx"
    })
});

router.post("/upload/excel/:productName", upload.single(), (req, res) => {
    debugger;


});

module.exports = router;