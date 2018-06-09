const express = require("express");
const router = express.Router();
const path = require("path");
const CI_con = require("../controller/con_CI");

/**
 * 请求对应的在CI_con中的操作
 * 
 */
const ACTIONS_MAP = {
    "/getProLine": "getAllLine",
    "/setNewPro": "newProLine",
    "/getAllProducts": "getAllProducts",
    "/editProduct": "editProduct"
};


// /**
//  * 匹配   /api/CI/** 下的请求
//  * 
//  */

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




// /**
//  * 匹配   /api/CI/** 下的请求
//  * 
//  */

// router.post("/getProLine", (req, res) => {
//     CI_con.getAllLine().then(data => {
//         res.json(data);
//     }).catch(err => {
//         res.json(err)
//     });
// });

// router.post("/setNewPro", (req, res) => {
//     CI_con.newProLine(req.body).then(data => {
//         res.json(data);
//     }).catch(err => {
//         res.json(err)
//     });
// });

// router.post("/getAllProducts", (req, res) => {
//     CI_con.getAllProducts().then((products) => {
//         res.json(products);
//     }).catch(err => {
//         res.json(err)
//     });
// });

// router.post("/editProduct", (req, res) => {
//     CI_con.editProduct(req.body).then((ret) => {
//         res.json(ret);
//     }).catch(err => {
//         res.json(err)
//     });
// });


module.exports = router;