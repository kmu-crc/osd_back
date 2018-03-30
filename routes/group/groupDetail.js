var connection = require("../../configs/connection");

exports.groupDetail = (req, res, next) => {
  const id = req.params.id;

  // 그룹 정보 가져오기 (GET)
  function getGroupInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM opendesign.group WHERE uid = ?", id, (err, result) => {
        if (!err) {
          let data = result[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 그룹 count 정보 가져오기 (GET)
  function getGroupCount (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT * FROM group_counter WHERE uid = ?", id, (err, result) => {
        if (!err) {
          data.count = result[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 디자인 리스트 가져오기 (GET)
  function getDesignList (data) {
    const id = data.uid;
    const sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time FROM group_join_design G JOIN design D ON D.uid = G.design_id WHERE group_id = ?";

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
                connection.query("SELECT s_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, result) => {
                  if (!err) {
                    data.thumbnailUrl = result[0];
                  } else {
                    reject(err);
                  }
                });
                getCategory(data);
                connection.query("SELECT * FROM design_counter WHERE design_id = ?", data.uid, (err, row) => {
                  if (!err) {
                    data.count = row[0];
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

    getList(id)
      .then(result => {
        data.designList = result;
        return data;
      }).then(result => res.json(result));
  }

  getGroupInfo(id)
    .then(getGroupCount)
    .then(getDesignList)
    .then(result => console.log(result));
};
