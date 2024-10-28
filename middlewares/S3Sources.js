const s3 = require("../configs/AWSConnection");
const fs = require("fs");
require("dotenv").config();

const deleteFs = (res) => {
  return new Promise((resolve, reject) => {
    fs.unlink(res, (err) => {
      if (err) reject(err);
      resolve(true);
    });
  });
};

exports.S3Sources = (res) => {
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
          // fs.unlink(res.file.path, (err) => {
          //   if (err) reject(err);
          // });
          resolve(result.Location);
        }
      });
    });
  });
};

exports.S3SourcesDetele = (res) => {
  //console.log("s3", res);
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${res.filename}`
    };
    s3.deleteObject(params, function (err, result) {
      if (err) {
        reject(err);
      } else {
        //console.log(result);
        resolve(true);
      }
    });
  });
};

exports.S3Upload = (res, filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(res, function (err, file_buffer) {
      if (err) reject(err);
      let filename_encoded = encodeURIComponent(filename);
      let type = 'text/pain; charset=utf-8'
      if( filename.search('.pdf') > -1) {
        type = 'application/pdf';
      }

      const upload = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: process.env.OPERATION ? `${res}`:`dev/${res}`,
        ACL: "public-read",
        Body: file_buffer,
	ContentType: type, // 'text/plain; charset=utf-8',
        ContentDisposition: 'attachment; filename="'+filename_encoded+'"'
      };
      s3.upload(upload, function (err, result) {
        if (err) {
          reject(err);
        } else {
          // local에 있는 thumbnail 파일을 s3에 업로드 성공하면 삭제한다.
          deleteFs(res)
            .then(resolve(result.Location))
            .catch(reject(err));
        }
      });
    });
  });
};
