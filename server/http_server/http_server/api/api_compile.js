const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const con_compile = require("../controller/con_compile");
let compiled = {};

/**
 * 匹配在线编译的请求
 */
router.post("/:productName", (req, res) => {
    let proName = req.params.productName;
    if (compiled[proName] && compiled[proName].lastCompileTime - new Date().getTime() < 60 * 1000) {
        res.json({
            status: "ok",
            message: "该项目最近一分钟内才被编译过,将下载上次编译的版本"
        });
    } else {
        con_compile.compile(proName)
            .then((zipPath) => {
                compiled[proName] = {
                    zipPath,
                    lastCompileTime: new Date().getTime(),
                    timer: null
                };
                res.json({
                    status: "ok",
                    message: "编译完成"
                });
            }).catch(err => {
                res.json({
                    status: "error",
                    errMessage: err
                })
            });
        // compiled["O3V2.0"] = {
        //     zipPath: "E:\\CITEST\\O3V2.0\\O3V2.0.zip",
        //     lastCompileTime: new Date().getTime(),
        //     timer: null
        // };
        // res.json({
        //     status: "ok",
        //     message: "编译完成"
        // });
    }


});

router.get("/:productName", (req, res) => {
    let proName = req.params.productName;
    res.download(compiled[proName].zipPath, `${proName}.zip`, function (err) {
        if (err) {
            throw err;
        } else {
            console.log(`下载${proName}.zip成功`);
        }

        //两分钟后删除zip文件
        clearTimeout(compiled[proName].timer);
        compiled[proName].timer = setTimeout(() => {
            fs.unlinkSync(compiled[proName].zipPath);
        }, 2 * 60 * 1000);
    });
})

module.exports = router;