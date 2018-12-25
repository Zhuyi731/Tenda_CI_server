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
const CI_con = require("../../controller/CI/con_CI");
const multer = require("multer");
const basicConfig = require("../../../config/basic_config").svnConfig;
const fo = require("../../util/fileOperation");
const fs = require("fs");
const dbModel = require("../../../datebase_mysql/dbModel");
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
let prop,
    upload = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                let excelDir = path.join(basicConfig.root, req.params.productName, "./ci_excel"),
                    excelName = path.join(excelDir, "lang.xlsx");

                fo.mkDirRecursively(excelDir);
                fs.existsSync(excelName) && fs.unlinkSync(excelName);
                cb(null, excelDir);
            },
            filename: (req, file, cb) => {
                cb(null, "lang.xlsx");
            }
        })
    });
/**
 * 匹配   /api/CI/** 下的请求
 * 请求对应的处理为ACTIONS_MAP中的函数;
 */
for (prop in ACTIONS_MAP) {
    let closure_prop = prop;
    router.post(prop, (req, res) => {
        CI_con[ACTIONS_MAP[closure_prop]](req.body)
            .then(data => {
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
    });
}

/**
 * 上传语言包文件
 * 如果
 */
router.post("/upload/excel/:productName", upload.single("excel"), (req, res) => {
    //更新数据库中excelUploaded字段
    dbModel.tableModels.Product
        .update({
            excelUploaded: 1
        }, {
            where: {
                product: {
                    "$eq": `${req.param.productName}`
                }
            }
        })
        // db
        //     .update("product", ["excelUploaded"], ["1"], `product="${req.params.productName}"`)
        .then(() => {
            res.json({
                status: "ok",
                message: "成功"
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                status: "error",
                errMessage: err
            });
        });
});

router.get("/download/excel/:productName", (req, res) => {
    let excelDir = path.join(basicConfig.root, req.params.productName, "./ci_excel"),
        excelName = path.join(excelDir, "lang.xlsx");

    if (fs.existsSync(excelDir) && fs.existsSync(excelName)) {
        res.download(excelName);
    } else {
        res.redirect("/");
    }
});

module.exports = router;