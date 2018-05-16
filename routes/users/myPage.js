var connection = require("../../configs/connection");

// 내 기본 정보 가져오기
exports.myPage = (req, res, next) => {
  const id = req.decoded.uid;
  // 마이페이지 내 기본 정보 가져오기 (GET)
  function getMyInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT U.uid, U.nick_name, U.thumbnail, D.category_level1, D.category_level2, D.about_me, D.is_designer FROM user U LEFT JOIN user_detail D ON D.user_id = U.uid WHERE U.uid = ?", id, (err, row) => {
        if (!err && row.length > 0) {
          let data = row[0];
          resolve(data);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
    return p;
  };

  // 내 프로필 사진 가져오기 (GET)
  function getThumbnail (data) {
    const p = new Promise((resolve, reject) => {
      // 넘어온 값이 없을때 분기!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      if (data.thumbnail === null) {
        resolve(data);
      } else {
        connection.query("SELECT s_img, m_img, l_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
          if (!err && row.length > 0) {
            data.profileImg = row[0];
          } else {
            console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 카테고리 이름 가져오기
  function getCategory (data) {
    const p = new Promise((resolve, reject) => {
      let cate;
      let sql;
      if (!data.category_level1 && !data.category_level2) {
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
          data.categoryName = result[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getMyInfo(id)
    .then(getThumbnail)
    .then(getCategory)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};

// 내 디자인 리스트 가져오기
exports.myDesign = (req, res, next) => {
  const id = req.decoded.uid;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, C.like_count, C.member_count, C.card_count, C.total_view_count FROM design_member M JOIN design D ON D.uid = M.design_id LEFT JOIN design_counter C ON C.design_id = D.uid WHERE user_id = ?";
  if (sort === "date") {
    sql = sql + "ORDER BY D.create_time DESC";
  } else if (sort === "like") {
    sql = sql + "ORDER BY C.like_count DESC";
  }

  function getList (id) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, id, (err, row) => {
        if (!err) {
          for (var i = 0, l = row.length; i < l; i++) {
            let data = row[i];
            arr.push(new Promise((resolve, reject) => {
              connection.query("SELECT nick_name FROM user WHERE uid = ?", data.user_id, (err, result) => {
                if (!err) {
                  data.userName = result[0].nick_name;
                } else {
                  reject(err);
                }
              });
              getCategory(data);
              connection.query("SELECT s_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, result) => {
                if (!err) {
                  data.thumbnailUrl = result[0];
                  resolve(data);
                } else {
                  reject(err);
                }
              });
            }));
          }
          Promise.all(arr).then(result => {
            resolve(result);
          }).catch(console.log("no"));
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  function getCategory (data) {
    let cate;
    let sqlCate;
    if (data.category_level2 && data.category_level2 !== "") {
      cate = data.category_level2;
      sqlCate = "SELECT name FROM category_level2 WHERE uid = ?";
    } else {
      cate = data.category_level1;
      sqlCate = "SELECT name FROM category_level1 WHERE uid = ?";
    }
    connection.query(sqlCate, cate, (err, result) => {
      if (!err) {
        data.categoryName = result[0];
      }
    });
  };

  getList(id)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
