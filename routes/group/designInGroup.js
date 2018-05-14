var connection = require("../../configs/connection");

exports.designInGroup = (req, res, next) => {
  const id = req.params.id;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, C.like_count, C.member_count, C.card_count, C.total_view_count FROM group_join_design G JOIN design D ON D.uid = G.design_id JOIN design_counter C ON C.design_id = D.uid WHERE group_id = ? ";
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
                  data.userName = result[0];
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
              // connection.query("SELECT * FROM design_counter WHERE design_id = ?", data.uid, (err, row) => {
              //   if (!err) {
              //     data.count = row[0];
              //     resolve(data);
              //   } else {
              //     reject(err);
              //   }
              // });
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
