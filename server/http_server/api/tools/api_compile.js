/**
 * @author zhuyi
 * @desc 此文件所在层级位于服务器API层，用于承接Controller层以及View层的数据通信。
 * API层匹配到请求后交给Controller层进行逻辑处理。处理完后返回信息即可。再由API层返回给页面
 * API层存在的目的是为了处理数据。Controller层最好不要处理数据，只关注逻辑
 * @license MIT license
 * @Version V1.0.0
 * @last modify 2018.8.2
 * @title 在线编译请求匹配
 */

const express = require("express");
const router = express.Router();
const fs = require("fs");
const con_compile = require("../../controller/tools/con_compile");
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
        con_compile
            .compile(proName)
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
            })
            .catch(err => {
                res.json({
                    status: "error",
                    errMessage: err
                })
            });
    }
});

router.get("/:productName", (req, res) => {
    let proName = req.params.productName;
    res.download(compiled[proName].zipPath, `${proName}.zip`, function (err) {
        if (err) throw err;

        console.log(`下载${proName}.zip成功`);

        //两分钟后删除zip文件
        clearTimeout(compiled[proName].timer);
        compiled[proName].timer = setTimeout(() => {
            fs.unlinkSync(compiled[proName].zipPath);
        }, 2 * 60 * 1000);
    });
})

module.exports = router;