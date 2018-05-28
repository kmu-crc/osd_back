const connection = require("../configs/connection");
const { S3Sources } = require("../middlewares/S3Sources");

exports.insertSource = (data) => {
  return new Promise((resolve, reject) => {
    let type = null;
    if (data.tabel === "design_source_file") {
      type = "sources";
    } else if (data.tabel === "design_images") {
      type = "images";
    }
    if (!data.files) resolve(null);

    const insertDB = (obj) => {
      return new Promise((resolve, reject) => {
        connection.query(`INSERT INTO ${data.tabel} SET ?`, obj, (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            reject(err);
          }
        });
      });
    };

    let PromiseArray = data.files.map((item) => {
      return new Promise((resolve, reject) => {
        let obj = {
          user_id: data.uid,
          card_id: data.card_id,
          name: item.originalname,
          link: null,
          type: item.mimetype
        };
        S3Sources({file: item, type}).then(path => {
          obj.link = path;
          return insertDB(obj);
        });
      });
    });
    console.log(PromiseArray);
    return Promise.all(PromiseArray).then(resolve(true)).catch((err) => {
      reject(err);
    });
  });
};
