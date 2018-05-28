const connection = require("../../configs/connection");

exports.createBoard = (req) => {
  return new Promise((resolve, reject) => {
    connection.query("INSERT INTO design_board SET ?", req, (err, rows) => {
      if (!err) {
        resolve(rows.insertId);
      } else {
        console.error("MySQL Error:", err);
        reject(err);
      }
    });
  });
};
