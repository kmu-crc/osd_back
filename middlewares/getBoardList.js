const connection = require("../configs/connection");

const getBoardList = (req, res, next) => {
  const sql = req.sql;

  const getBoardStatus = data => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT D.status FROM opendesign.deal D WHERE board_id = ${data.uid}`;
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.length > 0 ? row[0]["status"] : null);
        }
      });
    });
  };

  const getThumbnail = data => {
    return new Promise((resolve, reject) => {
      if (!data.thumbnail) {
        resolve(null);
      } else {
        connection.query("SELECT s_img, m_img FROM thumbnail WHERE uid=?", data.thumbnail, (err, row) => {
          if (!err) {
            resolve(row.length > 0 ? row[0] : null);
          } else {
            reject(err);
          }
        });
      }
    });
  };

  const getCategory = data => {
    return new Promise((resolve, reject) => {
      let cate;
      let sqlCate;
      if (!data.category_level1 && !data.category_level2) {
        resolve(null);
      } else if (data.category_level2 && data.category_level2 !== "") {
        cate = data.category_level2;
        sqlCate = `SELECT name FROM market.category_level2 WHERE parents_id=${data.category_level1} AND value=${data.category_level2}`;
      } else {
        cate = data.category_level1;
        sqlCate = `SELECT name FROM market.category_level1 WHERE uid = ${data.category_level1}`;
      }
      connection.query(sqlCate, cate, (err, result) => {
        if (!err) {
          resolve(result[0].name);
        } else {
          reject(err);
        }
      });
    });
  };

  const extend = article => {
    return new Promise((resolve, reject) => {
      getThumbnail(article)
        .then(url => {
          article.imgURL = url;
          return article;
        })
        .then(getBoardStatus)
        .then(status => {
          article.status = status;
          return article;
        })
        .then(getCategory)
        .then(name => {
          article.categoryName = name;
          resolve(article);
        })
        .catch(err => reject(err));
    });
  };

  const getList = sql => {
    return new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, (err, row) => {
        if (!err) {
          if (row.length) {
            row.map(article => arr.push(extend(article)));
            Promise.all(arr)
              .then(rst => resolve(rst))
              .catch(err => console.log(err));
          } else {
            resolve(null);
          }
        } else {
          reject(err);
        }
      });
    });
  };

  getList(sql)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};

module.exports = getBoardList;
