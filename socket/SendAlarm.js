const connection = require("../configs/connection");

function countAlarm (uid) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT count(confirm) FROM alarm WHERE user_id = ${uid} AND confirm = 0`, (err, rows) => {
      if (!err) {
        resolve(rows[0]["count(confirm)"]);
      } else {
        console.log("2번", err);
        reject(err);
      }
    });
  });
}

function sendAlarm (socketId, uid, count, io) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM alarm WHERE user_id = ${uid} ORDER BY create_time DESC LIMIT 5`, (err, rows) => {
      if (!err) {
        io.to(`${socketId}`).emit("getNoti", {count, list: rows});
      } else {
        console.log("2번", err);
        reject(err);
      }
    });
  });
};

exports.SendAlarm = (socketId, uid, contentId, message, io) => {
  let type = null;
  let kinds = null;
  if (message === "ReceiveMsg") {
    type = "MESSAGE";
    kinds = "SEND";
  }

  function insertAlarm (uid, type, kinds, content_id) {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO alarm SET ?", {user_id: uid, type, kinds, content_id, confirm: 0}, (err, rows) => {
        if (!err) {
          resolve(true);
        } else {
          console.log("2번", err);
          reject(err);
        }
      });
    });
  }

  insertAlarm(uid, type, kinds, contentId)
    .then(() => countAlarm(uid))
    .then(count => sendAlarm(socketId, uid, count, io))
    .catch();
};

exports.GetAlarm = (socketId, uid, io) => {
  countAlarm(uid)
    .then(count => sendAlarm(socketId, uid, count, io))
    .catch();
}
