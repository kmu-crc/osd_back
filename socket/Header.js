const connection = require("../configs/connection");

exports.GetNotification = (token, uid, io) => {
  connection.query("SELECT * FROM user LIMIT 10", (err, rows) => {
    if (!err) {
      io.sockets.emit("getNoti", rows);
    } else {
      //console.log("2번", err);
      throw err;
    }
  });
};
