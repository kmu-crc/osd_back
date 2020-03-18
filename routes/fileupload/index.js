const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: 'tmps/' });
const auth = require("../../middlewares/auth");

router.post("/tmp/:id",
    upload.single('file-to-upload'),
    (req, res) => {
        console.log("tmp file uploaded");
    }
);
router.post("/tmp/:id",
    upload.single('source'),
    (req, res, next) => {
        console.log("TMP File Uploaded");
        // const fileName = req.files.file.name
        // let uploadFile = req.files.file
        // console.log(uploadFile, fileName);
        // uploadFile.mv(
        //     `${__dirname}/public/files/${fileName}`,
        //     function (err) {
        //         if (err) {
        //             return res.status(500).send(err)
        //         }
        //         res.json({
        //             file: `public/${req.files.file.name}`,
        //         })
        //     }
        // )
    }
);
module.exports = router;
