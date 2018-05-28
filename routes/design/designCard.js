const connection = require("../../configs/connection");

exports.createCard = (req) => {
  return new Promise((resolve, reject) => {
    console.log("createCard", req);
    connection.query("INSERT INTO design_card SET ?", req, (err, rows) => {
      if (!err) {
        resolve(rows.insertId);
      } else {
        console.error("MySQL Error:", err);
        reject(err);
      }
    });
  });
};

exports.updateCard = (req) => {
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE design_card SET ? WHERE uid=${req.cardId} AND user_id=${req.userId}`, req.data, (err, rows) => {
      if (!err) {
        if (rows.affectedRows) {
          resolve(rows);
        } else {
          const err = "작성자 본인이 아닙니다.";
          reject(err);
        }
      } else {
        reject(err);
      }
    });
  });
};
