var connection = require("../../configs/connection");

exports.groupInGroup = (req, res, next) => {
  const id = req.params.id;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT R.uid, R.title, R.create_time, R.user_id, C.like, C.member, C.design, C.total_like FROM group_join_group G JOIN opendesign.group R ON R.uid = G.group_id LEFT JOIN group_counter C ON C.group_id = R.uid WHERE parent_group_id = ?";
  if (sort === "date") {
    sql = sql + "ORDER BY R.create_time DESC";
  } else if (sort === "like") {
    sql = sql + "ORDER BY C.like DESC";
  }

  function getGroupList (id) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          for (var i = 0, l = row.length; i < l; i++) {
            arr.push(new Promise((resolve, reject) => {
              let groupData = row[i];
              getThumbnail(groupData);
              connection.query("SELECT nick_name FROM user WHERE uid = ?", groupData.user_id, (err, result) => {
                if (!err) {
                  groupData.userName = result[0].nick_name;
                  resolve(groupData);
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

  function getThumbnail (data) {
    let arr = [];
    connection.query("SELECT D.uid, T.s_img FROM group_join_design G JOIN design D ON D.uid = G.design_id JOIN thumbnail T ON T.uid = D.thumbnail WHERE parent_group_id = ?", data.uid, (err, row) => {
      if (!err) {
        if (row.length > 3) {
          for (var i = 0; i < 3; i++) {
            arr.push(row[i]);
          }
        } else if (row.length <= 3) {
          arr = row;
        }
        data.designTop3 = row;
      } else {
        console.log(err);
      }
    });
  };

  getGroupList(id)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
