const express = require("express");
const router = express.Router();
const path = require("path");
const resouceBasePath = path.join(__dirname, "../../../resourcecs");

router.get("/*", (req, res) => {
    res.sendFile(path.join(resouceBasePath, req.path));
});

module.exports = router;