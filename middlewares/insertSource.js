const connection = require("../configs/connection");

exports.insertSource = (data) => {
  return new Promise((resolve, reject) => {
    if (!data.files) resolve(null);

    const insertDB = (obj) => {
      console.log("2222", obj);
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
      let obj = {
        user_id: data.uid,
        card_id: data.card_id,
        name: item.originalname,
        link: `http://localhost:8080/${item.path}`,
        type: item.mimetype
      };
      return new Promise((resolve, reject) => {
        insertDB(obj);
      });
    });
    console.log(PromiseArray);
    return Promise.all(PromiseArray).then(resolve(true)).catch(() => {
      const err = "업로드 실패";
      reject(err);
    });
  });
};
