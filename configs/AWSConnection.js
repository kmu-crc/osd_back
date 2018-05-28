const aws = require("aws-sdk");
require("dotenv").config();

let s3;
let options;

options = {
  secretAccessKey: process.env.AWS_SECRET_ACCESSKEY,
  accessKeyId: process.env.AWS_ACCESSKEY_ID
};

aws.config.update(options);

function connectionS3 () {
  if (!s3) {
    s3 = new aws.S3();
  }
  return s3;
};

module.exports = connectionS3();
