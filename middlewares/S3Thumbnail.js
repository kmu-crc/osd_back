const s3 = require("../configs/AWSConnection");
const fs = require("fs");
require("dotenv").config();

exports.S3Thumbnail = (res) => {
  let arr = [];
  for (let key in res) {
    if (key === "user_id") continue;
    const originFileName = res[key];
    arr.push(new Promise((resolve, reject) => {
      // fs를 이용하여 전송하려고 하는 파일에 접근 file_buffer를 s3로 전송
      fs.readFile(`thumbnails/${res[key]}`, function (err, file_buffer) {
        if (err) reject(err);
        const upload = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: process.env.OPERATION ? `thumbnails/${res[key]}`: `dev/thumbnails/${res[key]}`,
          ACL: "public-read",
          Body: file_buffer
        };
        s3.upload(upload, function (err, result) {
          if (err) {
            reject(err);
          } else {
            // s3에 업로드된 경로를 객체에 넣어준다.
            res[key] = result.Location;
            // local에 있는 thumbnail 파일을 s3에 업로드 성공하면 삭제한다.
            fs.unlink(`thumbnails/${originFileName}`, (err) => {
              if (err) reject(err);
            });
            resolve(result);
          }
        });
      });
    }));
  };
  return Promise.all(arr)
    .then(() => Promise.resolve(res))
    .catch(err => Promise.reject(err));
};
