var connection = require("../../configs/connection");

exports.designInGroup = (req, res, next) => {
  const id = req.params.id;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.is_public, C.like_count, C.member_count, C.card_count, C.view_count FROM group_join_design G JOIN design D ON D.uid = G.design_id LEFT JOIN design_counter C ON C.design_id = D.uid WHERE parent_group_id = ? ";
  if (sort === "date") {
    sql = sql + "ORDER BY D.create_time DESC";
  } else if (sort === "like") {
    sql = sql + "ORDER BY C.like_count DESC";
  }

  function getList (id) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          for (var i = 0, l = row.length; i < l; i++) {
            let data = row[i];
            arr.push(new Promise((resolve, reject) => {
              getUserName(data);
              getCategory(data);
              if (data.thumbnailUrl === null) {
                data.thumbnail = null;
                resolve(data);
              } else {
                connection.query("SELECT s_img, m_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
                  if (!err && row.length === 0) {
                    data.thumbnailUrl = null;
                    resolve(data);
                  } else if (!err && row.length > 0) {
                    data.thumbnailUrl = row[0];
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
          reject(err);
        }
      });
    });
    return p;
  };

  // 유저 닉네임 가져오는 함수
  function getUserName (data) {
    if (data.user_id === null) {
      data.userName = null;
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

  // 카테고리 이름 가져오는 함수
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

  getList(id)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
