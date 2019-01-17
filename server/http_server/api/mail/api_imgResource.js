const express = require("express");
const router = express.Router();
const path = require("path");
const imgResoucePath = path.join(__dirname,"../../../mail_server/resourcecs");

router.get("/resource/:imgName", (req, res) => {
    res.sendFile(path.join(imgResoucePath, req.params.imgName));
});