const fs = require("fs");

const imageUpload = async (req, res, next) => {
// console.log(req.body);
  if (req.body.files && req.body.files.length>0) {
    const WriteFile = (file, filename) => {
      let originname = filename.split(".");
      let name = new Date().valueOf() + "." + originname[originname.length - 1];
      return new Promise((resolve, reject) => {
        fs.writeFile(`uploads/${name}`, file, { encoding: "base64" }, err => {
          if (err) {
            reject(err);
          } else {
            resolve(`uploads/${name}`);
          }
        });
      });
    };
    let fileStr = req.body.files[0].value.split("base64,")[1];
    let data = await WriteFile(fileStr, req.body.files[0].name);
    let file = {
      image: data,
      filename: data.split("/")[1],
      uid: req.decoded.uid
    };
    req.file = file;
  } else {
    req.file = null;
  }
  delete req.body.files;
  next();
};

module.exports = imageUpload;
