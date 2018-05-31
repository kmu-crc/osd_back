const connection = require("../../configs/connection");

exports.joinMember = (req) => {
  console.log(req);
  return new Promise((resolve, reject) => {
    let arr = req.members.map(item => {
      return new Promise((resolve, reject) => {
        connection.query("INSERT INTO design_member SET ?", {design_id: req.design_id, user_id: item.uid}, (err, rows) => {
          if (!err) {
            resolve(rows.insertId);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        });
      });
    });
    Promise.all(arr)
      .then(() => resolve(true))
      .catch(() => reject(new Error("맴버등록 실패")));
  });
};
