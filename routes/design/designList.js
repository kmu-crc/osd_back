var connection = require("../../configs/connection");

exports.designList = (req, res, next) => {
  const level = req.params.level;
  const category = (level) ? req.params.category : "";
  let arr = [];
  let sql;
  if (level === " " || level === undefined) { // 카테고리 파라미터가 없는 경우
    console.log("this1");
    sql = "SELECT uid, user_id, title, thumbnail, category_level1, category_level2, updateTime FROM design";
  } else if (level === "1") { // 카테고리 레벨 1이 설정된 경우
    console.log("this2");
    sql = "SELECT uid, user_id, title, thumbnail category_level1, category_level2, updateTime FROM design WHERE category_level1 = ?";
  } else if (level === "2") { // 카테고리 레벨 2가 설정된 경우
    console.log("this3");
    sql = "SELECT uid, user_id, title, thumbnail category_level1, category_level2, updateTime FROM design WHERE category_level2 = ?";
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

  function getName (data) {
    const p = new Promise((resolve, reject) => {
      const userId = data.user_id;
      connection.query("SELECT nickname FROM user WHERE uid = ?", userId, (err, result) => {
        if (!err) {
          data.userName = result;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  function getThumbnail (data) {
    const p = new Promise((resolve, reject) => {
      const thumbnailId = data.thumbnail;
      connection.query("SELECT s_img FROM thumbnail WHERE uid = ?", thumbnailId, (err, result) => {
        if (!err) {
          data.thumbnailUrl = result;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  function getCategory (data) {
    const p = new Promise((resolve, reject) => {
      let cate;
      let sql;
      if (data.category_level2 && data.category_level2 !== "") {
        cate = data.category_level2;
        sql = "SELECT name FROM category_level2 WHERE uid = ?";
      } else {
        cate = data.category_level1;
        sql = "SELECT name FROM category_level1 WHERE uid = ?";
      }
      connection.query(sql, cate, (err, result) => {
        if (!err) {
          data.categoryName = result;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

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
    .then(getName)
    .then(getThumbnail)
    .then(getCategory)
    .then(getCount)
    .then(data => arr.push(data))
    .then(arr => res.json(arr));
};
