const s3 = require("../configs/AWSConnection");
const fs = require("fs");
require("dotenv").config();

exports.S3Sources = (res) => {
  console.log("res", res)
  return new Promise((resolve, reject) => {
    fs.readFile(res.file.path, function (err, file_buffer) {
      if (err) reject(err);
      const upload = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `${res.type}/${res.file.filename}`,
        ACL: "public-read",
        Body: file_buffer
      };
      s3.upload(upload, function (err, result) {
        if (err) {
          reject(err);
        } else {
          // local에 있는 thumbnail 파일을 s3에 업로드 성공하면 삭제한다.
          fs.unlink(res.file.path, (err) => {
            if (err) throw err;
          });
          resolve(result.Location);
        }
      });
    });
  });
};

exports.S3SourcesDetele = (res) => {
  console.log("s3", res);
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${res.filename}`
    };
    s3.deleteObject(params, function (err, result) {
      if (err) {
        reject(err);
      } else {
        console.log(result);
        resolve(true);
      }
    });
  });
};
