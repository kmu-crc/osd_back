const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { S3Upload } = require("../../middlewares/S3Sources");
// const upload = multer({ dest: 'tmps/' });
// const spawn = require('child_process').spawn

// const convertToMP4 = (filename) => {
//     return new Promise((resolve, reject) => {
//         const new_file_name = encoded_filename.replace(ext, "_.mp4")
//         const args = ['-y', '-i', `${filename}`, '-strict', '-2', '-c:a', 'aac', '-c:v', 'libx264', '-f', 'mp4', `${new_file_name}`]
//         var proc = spawn('ffmpeg', args)
//         console.log('Spawning ffmpeg ' + args.join(' '))
//         proc.on('exit', code => {
//             if (code === 0) {
//                 console.log('successful!')
//                 fs.unlink(filename, err => { if (err) console.log(err) })
//                 resolve(new_file_name)
//             }
//             else {
//                 console.log("why come here?ahm")
//                 reject(false)
//             }
//         })
//     })
// }
// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './tmps');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage })

router.post("/tmp",
    upload.single('source'),
    (req, res, next) => {
        console.log(req.files);
        const path = `tmps/${req.files.source.name}`;
        fs.writeFile(path, req.files.source.data, { encoding: "ascii" }, async err => {
            if (err) {
                console.log(err);
                res.status(500).json({ success: false, message: "file write failed" });
            } else {
                console.log(path);
                // let newfilename = null
                // if (req.files.source.name.search(".mp4") > -1) {
                // new_file_name = await convertToMP4(path).catch((err) => { console.log("err", err) });
                // }
                const s3path = await S3Upload(path, `${req.files.source.name}`) || null;
                console.log(s3path);
                res.status(200).json({ success: true, path: s3path, message: "good!" })
            }
        });
    }
);

module.exports = router;
