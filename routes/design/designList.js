var connection = require("../../configs/connection");

exports.designList = (req, res, next) => {
  const level = req.params.level;
  const category = req.params.category;
  let sql;
  if (level === " " || level === undefined) { // 카테고리 파라미터가 없는 경우
    console.log("this1");
    sql = "SELECT uid, user_id, title, thumbnail FROM design";
  } else if (level === "1") { // 카테고리 레벨 1이 설정된 경우
    console.log("this2");
    sql = "SELECT uid, user_id, title, thumbnail FROM design WHERE category_level1 = ?";
  } else if (level === "2") { // 카테고리 레벨 2가 설정된 경우
    console.log("this3");
    sql = "SELECT uid, user_id, title, thumbnail FROM design WHERE category_level2 = ?";
  }

  function getList (sql, category) {
    const p = new Promise((resolve, reject) => {
      connection.query(sql, category, (err, row) => {
        if (!err) {
          for (var i = 0, l = row.length; i < l; i++) {
            let designData = row[i];
            resolve(designData);
          }
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  function getThumbnail (data) {
    const p = new Promise((resolve, reject) => {
      const thumbnailId = data.thumbnail;
      connection.query("SELECT s_img FROM thumbnail WHERE uid = ?", thumbnailId, (err, row) => {
        if (!err) {
          data.thumbnail = row[0].s_img;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  function getCount (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT * FROM design_counter WEHRE design_id = ?", id, (err, row) => {
        if (!err) {
          data.count = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getList(sql, category)
    .then(getThumbnail)
    .then(getCount)
    .then(data => res.json(data));
};
