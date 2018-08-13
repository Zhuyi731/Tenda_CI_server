/**
 * @author zhuyi
 * @desc 此文件所在层级位于服务器API层，用于承接Controller层以及View层的数据通信。
 * API层匹配到请求后交给Controller层进行逻辑处理。处理完后返回信息即可。再由API层返回给页面
 * API层存在的目的是为了处理数据。Controller层最好不要处理数据，只关注逻辑
 * @license MIT license
 * @Version V1.0.0
 * @last modify 2018.8.2
 * @title OEM定制工具请求匹配
 */

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const controller = require("../controller/con_oem");

/**
 * 获取config
 * */
router.post("/creatOem", (req, res) => {
    controller.creatOem(req.body.name, req.body.src, req.body.version)
        .then(config => {
            res.json(config);
        }).catch(err => {
            res.json(err);
        });
});

router.post("/setConfig/:name", (req, res) => {
    try {
        controller.setConfig(req.body, req.params.name);
        res.json({
            status: "ok"
        });
    } catch (e) {
        console.log(e);
        res.json({
            status: "error",
            errMessage: e.toString()
        })
    }

});

router.post("/preview/:name", (req, res) => {
    try {
        let port = controller.preview(req.params.name);
        res.json({
            status: "ok",
            port
        });
    } catch (e) {
        res.json({
            status: "error",
            errMessage: e
        })
    }

});

/**
 * 这个请求实际上是让文件夹压缩
 */
router.post("/compress/:name", (req, res) => {
    controller.compressCode(req.params.name)
        .then(ret => {
            res.json(ret);
        })
        .catch(ret => {
            res.json(ret);
        })
});

/**
 * 这个请求才是下载文件
 */
router.get("/download/:name", (req, res) => {
    let downloadPath = controller.getDownloadPath(req.params.name);
    res.download(downloadPath, err => {
        if (err) {
            console.log(err);
            throw err;
        }
    });
});


module.exports = router;