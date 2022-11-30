const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const { S3Upload } = require("../../middlewares/S3Sources");
const connection = require("../../configs/connection");

//// SET STORAGE
//var storage = multer.diskStorage({
//    destination: function (req, file, cb) {
//        cb(null, './tmps');
//    },
//    // filename: function (req, file, cb) {
//    //     cb(null, file.originalname);
//    // }
//});
//var upload = multer({ storage: storage })
//
//router.post("/tmp",
//    upload.single('source'),
//    async (req, res, next) => {
//        console.log(req.file);
//        const s3path = await S3Upload(req.file.path, `${req.file.originalname}`) || null;
//        console.log(s3path);
//        res.status(200).json({ success: true, path: s3path, message: "good!" })
//    }
//);

 // SET STORAGE
 var storage = multer.diskStorage({
     destination: function (req, file, cb) {
         cb(null, './uploads');
     },
     filename: function (req, file, cb) {
         cb(null, file.originalname);
     }
 });
 var upload = multer({ storage: storage })

router.post("/detect-encoding",
    upload.single('source'),
     (req, res, next) => {
         const path = `uploads/${req.files.source.md5}${new Date().getTime()}`;
         fs.writeFile(path, req.files.source.data, { encoding: "ascii" }, async err => {
             if (err) {
                 console.log(err);
                 res.status(500).json({ success: false, message: "file write failed" });
             } else {
						 		const fs = require("fs");
								const detectCharacterEncoding = require("detect-character-encoding");
								const fb = fs.readFileSync(path);
								const charset = detectCharacterEncoding(fb);
                 res.status(200).json({ success: true, charset: charset });
             }
         });
     }
 );
router.post("/tmp",
	upload.single('source'),
		(req, res, next) => {

			// console.log(req.files);
			const ext = req.files.source.name.split('.').pop();
			const path = `uploads/${req.files.source.md5}${new Date().getTime()}${
				ext === "pdf" ? ".pdf" //req.files.source.mimetype ==="application/pdf" ?".pdf"
			: ext === "stl" ? ".stl" // req.files.source.mimetype ==="application/octet-stream" ?  ".stl"
			: ext === "dxf" ? ".dxf"
			: ""}`;

			fs.writeFile(path, req.files.source.data, { encoding: "ascii" }, async err => {

				if (err) {
					console.log(err);
					res.status(500).json({ success: false, message: "file write failed" });

				} else {

					// let newfilename = null
					// if (req.files.source.name.search(".mp4") > -1) { new_file_name = await convertToMP4(path).catch((err) => { console.log("err", err) }); }
					// console.log(s3path);

if(
	req.files.source.name.search(".png") > -1 || 
	req.files.source.name.search(".bmp") > -1 || 
	req.files.source.name.search(".jpg") > -1 || 
	req.files.source.name.search(".jpeg")> -1
) {


const image_procedure = () =>
	new Promise(async (resolve) => {
		const gm = require('gm');
		await gm(path)
			.size(async (err, size) => 
			{ 
				let { width, height } = size;
				if( width * height >= 2000 * 2000) 
				{ 
					await gm(path)
						.resize( 1920)//, 1080)
						.write( path + "+", err => {
							if( !err) {
								resolve(true);	
							} else {
								resolve(false);
							}
						});
				} else {
					resolve(false);
				}
			});
	});

	image_procedure()
		.then(async isResized => {
				if(isResized){
					fs.unlink(path, err => { if (err) console.log(err) })
				}
				const newpath = isResized ? path + "+" : path;
				const	s3path = await S3Upload(newpath, `${req.files.source.name}`) || null;
				res.status(200).json({ success: true, path: s3path, message: "good!" })
		})
}
else {
					const s3path = await S3Upload(path, `${req.files.source.name}`) || null;
					res.status(200).json({ success: true, path: s3path, message: "good!" });
}
			}
		});

	}
);

router.get("/fixit",
    (req, res, next) => {
        return new Promise((resolve, reject) => {

            const getRecentUpdatedCard = (design) => {
                return new Promise((resolve, reject) => {
                    const sql = `SELECT * FROM opendesign.design_card WHERE uid=${design.uid} ORDER BY update_time DESC LIMIT 1`;
                    connection.query(sql, (err, row) => {
                        if (!err) {
                            resolve(row[0] ? row[0]["update_time"] : null);
                        } else {
                            reject(err);
                        };
                    });
                });
            };

            const getDesignIds = () => {
                return new Promise((resolve, reject) => {
                    const sql = `SELECT * FROM opendesign.design`;
                    connection.query(sql, (err, row) => {
                        if (!err) {
                            resolve(row);
                        } else {
                            res.status(500).json({ error: err });
                            reject(err);
                        }
                    });
                });
            };

            getDesignIds()
                .then(design => {
                    let diff = [];
                    const different =
                        design &&
                        design.length &&
                        design.filter(async item => {
                            diff.push({ design: item.update_time, card: await getRecentUpdatedCard(item) });
                            return (item.uid && (item.update_time !== await getRecentUpdatedCard(item)))
                        }
                        );
                    // console.log("design cnt:", design.length || 0, "different cnt:", different.length || 0);
                    return diff;
                }).then(data => {
                    res.status(200).json({ success: true, data: data });
                }).catch(error => {
                    res.status(500).json({ success: false, message: error });
                });
        });
    }
);


module.exports = router;

// ENCODING FLOW
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
