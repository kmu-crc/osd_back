var connection = require("../../configs/connection");

exports.designerList = (req, res, next) => {
  // 디자이너 리스트 가져오기 (GET)
  function getDesignerList () {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query("SELECT U.uid, U.nick_name, D.category_level1, D.category_level2, U.thumbnail, C.total_design, C.total_group, C.total_like, C.total_view FROM user_detail D JOIN user U ON U.uid = D.user_id LEFT JOIN user_counter C ON C.user_id = U.uid WHERE D.is_designer = 1", (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
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
  //       console.log(err);
  //     }
  //   });
  // };

  // 디자이너 본인의 썸네일 가져오는 함수
  function getMyThumbnail (data) {
    return new Promise((resolve, reject) => {
      connection.query("SELECT s_img, m_img FROM thumbnail WHERE user_id = ?", data.uid, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          resolve(row[0]);
        } else {
          return err;
        }
      });
    });
  };

  // 카테고리 이름 가져오는 함수
  function getCategory (data) {
    return new Promise((resolve, reject) => {
      let cate;
      let sqlCate;
      if (!data.category_level1 && !data.category_level2) {
        resolve(data);
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

  getDesignerList()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
