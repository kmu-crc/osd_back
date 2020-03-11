const connection = require("../configs/connection");

const getExpertList = (req, res, next) => {
  const sql = req.sql;

  const getExpertList = (sql) => {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          row.map(data => { arr.push(newData(data)) });
          Promise.all(arr).then(result => { resolve(result) });
        } else {
          reject(err);
        }
      });
    });
    return p;
  };
  const newData = (data) => {
    return new Promise((resolve, reject) => {
      getMyThumbnail(data).then(url => {
        data.imgURL = url;
        return data;
      }).then(
        getCategory
      ).then(name => {
        data.categoryName = name;
        resolve(data);
      }).catch(err => {
        reject(err);
      });
    });
  };
  const getMyThumbnail = (data) => {
    return new Promise((resolve, reject) => {
      if (!data.thumbnail) {
        resolve(null);
      } else {
        connection.query("SELECT m_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            resolve(row[0]);
          } else {
            return err;
          }
        });
      }
    });
  };
  const getCategory = (data) => {
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
      connection.query(sqlCate, (err, result) => {
        if (!err) {
          resolve(result[0].name);
        } else {
          reject(err);
        }
      });
    });
  };

  getExpertList(sql)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};

module.exports = getExpertList;
