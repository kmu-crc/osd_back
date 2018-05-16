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
          for (var i = 0, l = row.length; i < l; i++) {
            arr.push(new Promise((resolve, reject) => {
              let designerData = row[i];
              // getThumbnail(designerData);
              getCategory(designerData);
              connection.query("SELECT s_img, m_img FROM thumbnail WHERE user_id = ?", designerData.uid, (err, row) => {
                if (!err && row.length === 0) {
                  designerData.imgURL = null;
                  resolve(designerData);
                } else if (!err && row.length > 0) {
                  designerData.imgURL = row[0];
                  resolve(designerData);
                } else {
                  reject(err);
                }
              });
            }));
          }
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

  // 카테고리 이름 가져오는 함수 (이것만 따로 분리함)
  function getCategory (data) {
    let cate;
    let sqlCate;
    if (!data.category_level1 && !data.category_level2) {
      data.categoryName = null;
      return data;
    } else if (data.category_level2 && data.category_level2 !== "") {
      cate = data.category_level2;
      sqlCate = "SELECT name FROM category_level2 WHERE uid = ?";
    } else {
      cate = data.category_level1;
      sqlCate = "SELECT name FROM category_level1 WHERE uid = ?";
    }
    connection.query(sqlCate, cate, (err, result) => {
      if (!err) {
        data.categoryName = result[0];
      } else {
        return err;
      }
    });
  };

  getDesignerList()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
