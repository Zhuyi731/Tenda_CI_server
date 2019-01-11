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
const controller = require("../../controller/tools/con_oem");
const multer = require('multer');
const path = require("path");
const { oemConfig } = require("../../../config/basic_config");
const fs = require("fs");

router.post("/getBaseLines", (req, res) => {
    controller
        .getAllOemBaseLines()
        .then(baseLines => {
            res.json(baseLines);
        })
        .catch(err => {
            res.json({
                status: "error",
                errMessage: err.message
            })
        });
});

/**
 * 获取config
 * */
router.post("/creatOem", (req, res) => {
    controller
        .createOem(req.body)
        .then(config => {
            res.json(config);
        })
        .catch(err => {
            res.json(err);
        });
});

/**
 * 实时校验配置项
 */
router.post("/validate/:name", (req, res) => {
    let field = req.body.field,
        value = req.body.value,
        name = req.params.name,
        message;

    message = controller.validate(name, field, value);
    res.json({ message });
});


let uploader = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            let dirPath = path.join(oemConfig.root, "img_temp_dir");

            !fs.existsSync(dirPath) && fs.mkdirSync(dirPath);
            cb(null, dirPath);
        },
        filename: (req, file, cb) => {
            let fileName = `img_temp_${~~Math.random()*10000}_${Date.now().toString()}`;
            cb(null, fileName);
        }
    })
});
/**
 * 替换图片
 */
router.post("/uploadImg", uploader.single("img"), (req, res) => {
    try {
        controller
            .replaceImg(req.body, req.file);

        res.json({
            status: "ok",
            message: "替换图片成功"
        });
    } catch (e) {
        res.json({
            status: "error",
            errMessage: "替换图片出错"
        });
    }
});

/**
 * 点击上传配置时触发
 */
router.post("/setConfig/:name", (req, res) => {
    let name = req.params.name;
    try {
        let warns = controller.setConfig(req.body, name);
        if (warns.length > 0) {
            res.json({
                status: "warning",
                warnMessage: warns.join("<br/>")
            });
        } else {
            res.json({
                status: "ok",
                message: "配置保存成功！"
            });
        }
    } catch (e) {
        res.json({
            status: "error",
            errMessage: e.message
        });
    }
});

/**
 * 点击预览界面时触发
 */
router.post("/preview/:name", (req, res) => {
    controller
        .preview(req.params.name)
        .then(port => {
            res.json({
                status: "ok",
                port
            });
        })
        .catch(e => {
            res.json({
                status: "error",
                errMessage: e.message
            });
        });
});

/**
 * 这个请求实际上是让文件夹压缩
 */
router.post("/compress/:name", (req, res) => {
    res.json = res.json.bind(res);
    controller
        .compressProject(req.params.name)
        .then(res.json)
        .catch(res.json);
});

/**
 * 这个请求才是下载文件
 */
router.get("/download/:name", (req, res) => {
    let downloadPath = controller.getDownloadPath(req.params.name);
    res.download(downloadPath, err => {
        if (err) {
            console.log(err);
        }
    });
});


module.exports = router;