var connection = require("../../configs/connection");

exports.makerDetail = (req, res, next) => {
  const id = req.params.id;

  function getDetailInfo(id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT U.uid, U.nick_name, U.thumbnail, D.category_level1, D.category_level2, D.about_me FROM user U LEFT JOIN user_detail D ON U.uid = D.user_id WHERE U.uid = ?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };
  function getThumbnail(data) {
    return new Promise((resolve, reject) => {
      if (data.thumbnail === null) {
        data.imgURL = null;
        resolve(data);
      } else {
        const sql = `SELECT m_img FROM thumbnail WHERE uid = ${data.thumbnail};`;
        console.log(sql);
        connection.query(sql, (err, row) => {
          if (!err && row.length === 0) {
            data.imgURL = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.imgURL = row[0]["m_img"];
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
  }
  function getCategory(data) {
    const p = new Promise((resolve, reject) => {
      let cate;
      let sql;
      if (!data.category_level1 && !data.category_level2) {
        data.categoryName = null;
        resolve(data);
      } else if (data.category_level2 && data.category_level2 !== "") {
        cate = data.category_level2;
        sql = "SELECT name FROM category_level2 WHERE uid = ?";
      } else {
        cate = data.category_level1;
        sql = "SELECT name FROM category_level1 WHERE uid = ?";
      }
      connection.query(sql, cate, (err, result) => {
        if (!err) {
          data.categoryName = result[0].name;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };
  function getCount(data) {
    return new Promise((resolve, reject) => {
      connection.query("SELECT total_like, total_design, total_group, total_view FROM user_counter WHERE user_id = ?", id, (err, row) => {
        if (!err) {
          data.Count = row[0] || null
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  getDetailInfo(id)
    .then(getThumbnail)
    .then(getCategory)
    .then(getCount)
    .then(result => res.status(200).json(result))
    .catch(err => { console.log(err); res.status(500).json(err); });
};
