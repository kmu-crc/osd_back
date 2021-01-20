const connection = require("../configs/connection");

const getDesignerList = (req, res, next) => {
  const sql = req.sql;
  //console.log(sql);
  // 디자이너 리스트 불러오기 (GET)
  function getDesignerList (sql) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          //console.log(row);
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

  function newData (data) {
    return new Promise((resolve, reject) => {
      getMyThumbnail(data).then(url => {
        data.imgURL = url;
        resolve(data);
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
  function getMyThumbnail (data) {
    return new Promise((resolve, reject) => {
      if (!data.thumbnail) {
        resolve(null);
      } else {
        connection.query("SELECT s_img, m_img,l_img FROM opendesign.thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
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
  function getCategory (data) {
    return new Promise((resolve, reject) => {
      let cate;
      let sqlCate;
      if (!data.category_level1 && !data.category_level2) {
        resolve(null);
      } else if(data.category_level3&&data.category_level3 !== ""){
        cate = data.category_level3;
        sqlCate = "SELECT name FROM category_level3 WHERE uid = ?";
      }else if (data.category_level2 && data.category_level2 !== "") {
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

  getDesignerList(sql)
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => res.status(500).json(err));
};

module.exports = getDesignerList;
