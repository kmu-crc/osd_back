var connection = require("../../configs/connection");

exports.getMakerReviewCount = (req, res, next) => {
  const id = req.params.id;

  const getReview = () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT COUNT(*) AS 'count' FROM market.review
          WHERE item_id IN 
            (SELECT uid FROM market.item WHERE user_id = ${id}) AND sort_in_group LIKE 0`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row[0] ? row[0]['count'] : 0);
        } else {
          reject(err);
        }
      })
    });
  }
  const respond = total => { res.status(200).json({ success: true, data: total }) }
  const error = err => { res.status(500).json({ success: false, data: err }) };
  getReview()
    .then(respond)
    .catch(error);
};
exports.getMakerReview = (req, res, next) => {
  const id = req.params.id;
  const page = req.params.page || 0;

  const getReview = () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          R.item_id, R.sort_in_group, R.user_id, R.payment_id, R.comment, R.score, 
          T.m_img, U.nick_name
        FROM market.review R
          LEFT JOIN market.item I ON I.uid = R.item_id
          LEFT JOIN market.thumbnail T ON T.uid = I.thumbnail_id
          LEFT JOIN market.user U ON U.uid = R.user_id
            WHERE item_id IN 
              (SELECT uid FROM market.item WHERE user_id = ${id}) 
          AND sort_in_group LIKE 0
        LIMIT ${page * 10}, 10`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          reject(err);
        }
      })
    });
  }
  const respond = data => { res.status(200).json({ success: true, data: data }) }
  const error = err => { res.status(500).json({ success: false, data: err }) };
  getReview()
    .then(respond)
    .catch(error);
};

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
        // console.log(sql);
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
        sqlCate = `SELECT name FROM market.category_level2 WHERE parents_id=${data.category_level1} AND value=${data.category_level2}`;
      } else {
        cate = data.category_level1;
        sqlCate = `SELECT name FROM market.category_level1 WHERE uid = ${data.category_level1}`;
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
