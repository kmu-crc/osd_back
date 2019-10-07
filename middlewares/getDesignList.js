const connection = require("../configs/connection");

const getDesignList = (req, res, next) => {
  const sql = req.sql;
  // //console.log(sql);
  // 디자인 리스트 가져오기 (GET)
  function getList (sql) {
    return new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          //console.log("+++", row);
          row.map(data => {
            arr.push(newData(data));
          });
          Promise.all(arr).then(result => {
            resolve(result);
          });
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  function newData (data) {
    return new Promise((resolve, reject) => {
      getUserName(data).then(name => {
        data.userName = name;
        return data;
      }).then(
        getCategory
      ).then(name => {
        data.categoryName = name;
        return data;
      }).then(
        getThumbnail
      ).then(url => {
        data.thumbnailUrl = url;
        resolve(data);
      }).catch(err => {
        reject(err);
      });
    });
  };

  // 유저 닉네임 가져오는 함수
  function getUserName (data) {
    return new Promise((resolve, reject) => {
      if (data.user_id === null) {
        resolve(null);
      } else {
        connection.query("SELECT nick_name FROM user WHERE uid = ?", data.user_id, (err, result) => {
          if (!err) {
            resolve(result[0].nick_name);
          } else {
            reject(err);
          }
        });
      }
    });
  };

  // 카테고리 이름 가져오는 함수
  function getCategory (data) {
    return new Promise((resolve, reject) => {
      let cate;
      let sqlCate;
      if (!data.category_level1 && !data.category_level2) {
        resolve(null);
      } else if (data.category_level2 && data.category_level2 !== "") {
        cate = data.category_level2;
        sqlCate = "SELECT name FROM category_level2 WHERE uid = ?";
      } else {
        cate = data.category_level1;
        sqlCate = "SELECT name FROM category_level1 WHERE uid = ?";
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

  // 디자인 썸네일 가져오는 함수
  function getThumbnail (data) {
    return new Promise((resolve, reject) => {
      if (data.thumbnail === null) {
        resolve(null);
      } else {
        connection.query("SELECT s_img, m_img, l_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            resolve(row[0]);
          } else {
            reject(err);
          }
        });
      }
    });
  }

  getList(sql)
    .then(data => {
      // //console.log("list", data);
      res.status(200).json(data);
    })
    .catch(err => res.status(500).json(err));
};

module.exports = getDesignList;
