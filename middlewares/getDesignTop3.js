const connection = require("../configs/connection");

const getDesignTop3 = (data, id) => {
  const getDesignObj = (id) => {
    let designObj = {
      "design_id": null,
      "s_img": null
    };
    let sql;
    if (id === "groupId") {
      sql = "SELECT design_id FROM group_join_design WHERE group_id = ?";
    } else if (id === "designerId") {
      sql = "SELECT uid FROM design WHERE user_id = ?";
    }
    const p = new Promise((resolve, reject) => {
      const arr = [];
      connection.query(sql, id, (err, result) => {
        if (!err) {
          const designList = result[0];
          for (var i = 0; i < 3; i++) {
            arr.push(new Promise((resolve, reject) => {
              const designId = designList[i];
              connection.query("SELECT T.s_img FROM design D JOIN thumbnail T ON D.thumbnail = T.uid WHERE D.uid = ?", designId, (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  designObj.s_img = result[0];
                  designObj.design_id = designId;
                  resolve(designObj);
                }
              });
            }));
          }
          Promise.all(arr).then(() => {
            resolve(designObj);
          });
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getDesignObj(id)
    .then(function (designObj) {
      data.designTop3 = designObj;
    })
    .then(data);
};

module.exports = getDesignTop3;
