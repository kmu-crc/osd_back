const connection = require("../configs/connection");

const getDesignerList = (req, res, next) => {
  const sql = req.sql;
  // console.log(sql);
  // 디자이너 리스트 불러오기 (GET)
  function getDesignerList(sql) {
    // console.log("getDesignerList", sql);
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          // console.log("row", row);
          row.map(data => {
            arr.push(newData(data));
          });
          Promise.all(arr).then(result => {
            resolve(result);
          });
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  function newData(data) {
    // console.log("newData",data);
    return new Promise((resolve, reject) => {
      getMyThumbnail(data).then(url => {
        data.imgURL = url;
        return data;
      }).then(
        getCategory
      ).then(name => {
        data.categoryName = name;
        return data;
        // resolve(data);
      }).then(getLikeCount)
        .then(count => {
          data.likeCount = count;
          // console.log("likecount ========== ",data);
          return data;
        }).then(getItemCount)
        .then(count => {
          data.itemCount = count;
          // console.log("likecount ========== ",data);
          resolve(data);
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  const getLikeCount = (data) => {
    const designer = "designer";
    const designerId = data.user_id;
    // console.log("designerId:", designerId);
    return new Promise((resolve, reject) => {
      connection.query(`SELECT count(*) as "count" FROM market.like WHERE to_id=${designerId} AND type="${designer}";`, (err, result) => {
        if (!err) {
          // console.log("getCount == ", result[0]);
          resolve(result[0].count);
        } else {
          reject(err);
        }
      });
    });
  };
  const getItemCount = (data) => {
    const designerId = data.user_id;
    return new Promise((resolve, reject) => {
      connection.query(`SELECT count(*) as "count" FROM market.item WHERE user_id=${designerId};`, (err, result) => {
        if (!err) {
          // console.log("getCount == ", result[0]);
          resolve(result[0].count);
        } else {
          reject(err);
        }
      });
    });
  };
  // function getThumbnail (data) {
  //   let arr = [];
  //   connection.query("SELECT D.uid, T.s_img FROM design D JOIN thumbnail T ON T.uid = D.thumbnail WHERE D.user_id = ?", data.uid, (err, row) => {
  //     if (!err) {
  //       if (row.length > 3) {
  //         for (var i = 0; i < 3; i++) {
  //           arr.push(row[i]);
  //         }
  //       } else if (row.length <= 3) {
  //         arr = row;
  //       }
  //       data.designTop3 = arr;
  //     } else {
  //       //console.log(err);
  //     }
  //   });
  // };

  // 디자이너 본인의 썸네일 가져오는 함수
  function getMyThumbnail(data) {
    // console.log("getMyThumbnail");
    return new Promise((resolve, reject) => {
      if (!data.thumbnail) {
        resolve(null);
      } else {
        connection.query("SELECT s_img, m_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
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

  // 카테고리 이름 가져오는 함수
  function getCategory(data) {
    return new Promise((resolve, reject) => {
      if (!data.category_level1 && !data.category_level2) {
        resolve(null);
      }
      // console.log("data.category_level1:::::",data.category_level1,data.category_level2);
      const sql = data.category_level2 && data.category_level2 !== "undefined"
        ? `SELECT name FROM market.category_level2 WHERE parents_id=${data.category_level1} AND value=${data.category_level2}`
        : `SELECT name FROM market.category_level1 WHERE uid=${data.category_level1}`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row[0] ? row[0]["name"] : null);
        } else {
          reject(err);
        }
      });
    });
  };

  getDesignerList(sql)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};

module.exports = getDesignerList;
