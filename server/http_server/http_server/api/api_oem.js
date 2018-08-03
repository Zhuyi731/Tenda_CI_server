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