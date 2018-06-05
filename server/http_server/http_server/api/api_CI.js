const express = require("express");
const router = express.Router();
const path = require("path");

const CI_con = require("../controller/con_CI");


/**
 * 匹配   /api/CI/** 下的请求
 * 
 */

router.post("/getProLine", (req, res) => {
    CI_con.getAllLine().then((data) => {
        res.json(data);
    }).catch(err => {
        res.json({
            "status": "error",
            "errMessage": "Database error"
        })
    });
});

router.post("/setNewPro", (req, res) => {
    CI_con.newProLine(req.body).then((data) => {
        res.json(data);
    }).catch(err => {
        res.json({
            "status": "error",
            "errMessage": "Database error"
        })
    });
});

router.post("/getAllProducts", (req, res) => {
    CI_con.getAllProducts().then((products) => {
        res.json(products);
    }).catch(err => {
        res.json({
            "status": "error",
            "errMessage": "Database error"
        })
    });
});

router.post("/editProduct", (req, res) => {
    CI_con.editProduct(req.body).then((ret) => {
        res.json(ret);
    }).catch(err => {
        res.json({
            "status": "error",
            "errMessage": "Database error"
        })
    });
});


module.exports = router;