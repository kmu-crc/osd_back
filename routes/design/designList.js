var connection = require("../../configs/connection");

// 디자인 리스트 가져오기 (GET)
exports.designList = (req, res, next) => {
  const level = req.query.level;
  const category = (level) ? req.query.category : "";
  let sql;
  if (level === " " || level === undefined) { // 카테고리 파라미터가 없는 경우
    console.log("this1");
    sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.is_public, C.like_count, C.member_count, C.card_count, C.view_count FROM design D LEFT JOIN design_counter C ON C.design_id = D.uid";
  } else if (level === "1") { // 카테고리 레벨 1이 설정된 경우
    console.log("this2");
    sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.is_public, C.like_count, C.member_count, C.card_count, C.view_count FROM design D LEFT JOIN design_counter C ON C.design_id = D.uid WHERE category_level1 = ?";
  } else if (level === "2") { // 카테고리 레벨 2가 설정된 경우
    console.log("this3");
    sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.is_public, C.like_count, C.member_count, C.card_count, C.view_count FROM design D LEFT JOIN design_counter C ON C.design_id = D.uid WHERE category_level2 = ?";
  }

  function getList (sql, category) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, category, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          for (var i = 0, l = row.length; i < l; i++) {
            let data = row[i];
            arr.push(new Promise((resolve, reject) => {
              getUserName(data);
              getCategory(data);
              if (data.thumbnail === null) {
                resolve(data);
              } else {
                connection.query("SELECT s_img, m_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, result) => {
                  if (!err) {
                    data.thumbnailUrl = result[0];
                    resolve(data);
                  } else {
                    reject(err);
                  }
                });
              }
            }));
          }
          Promise.all(arr).then(result => {
            resolve(result);
          }).catch(console.log("no"));
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
    return p;
  };

  // 유저 닉네임 가져오는 함수
  function getUserName (data) {
    if (data.user_id === null) {
      return data;
    } else {
      connection.query("SELECT nick_name FROM user WHERE uid = ?", data.user_id, (err, result) => {
        if (!err) {
          data.userName = result[0].nick_name;
        } else {
          return err;
        }
      });
    }
  };

  // 카테고리 이름 가져오는 함수 (이것만 따로 분리함)
  function getCategory (data) {
    let cate;
    let sqlCate;
    if (!data.category_level1 && !data.category_level2) {
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

  getList(sql, category)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};
