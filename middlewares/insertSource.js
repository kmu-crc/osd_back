const connection = require("../configs/connection");
const { S3Sources } = require("../middlewares/S3Sources");

exports.insertSource = async data => {
  let type = null;
  if (data.tabel === "design_source_file") {
    type = "sources";
  } else if (data.tabel === "design_images") {
    type = "images";
  }
  if (!data.files) Promise.resolve(null);

  const insertDB = obj => {
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

  let PromiseArray = [];

  //console.log("data", data);
  for (let item of data.files) {
    let obj = {
      user_id: data.uid,
      card_id: data.card_id,
      name: item.originalname,
      link: null,
      type: item.mimetype
    };
    await S3Sources({ file: item, type }).then(path => {
      obj.link = path;
      return insertDB(obj).then(PromiseArray.push(true)).catch(err => PromiseArray.push(err));
    });
  }
  //console.log(PromiseArray);
  return Promise.all(PromiseArray)
    .then(Promise.resolve(true))
    .catch(err => {
      Promise.reject(err);
    });
};
