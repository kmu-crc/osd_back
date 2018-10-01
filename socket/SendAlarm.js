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

function sendAlarm (socketId, uid, count, io, fromUserId) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM alarm WHERE user_id = ${uid} ORDER BY create_time DESC`, (err, rows) => {
      if (!err) {
        addTitle(socketId, {count, list: rows}, io, uid);
      } else {
        console.log("2번", err);
        reject(err);
      }
    });
  });
};

function addTitle (socketId, alarm, io, uid) {
  return new Promise(async (resolve, reject) => {
    let newList = [];
    for (let item of alarm.list) {
      let query = null;
      let target = null;
      let fromUserId = null;
      if (item.type === "MESSAGE") {
        fromUserId = await getFromUser(uid, item.content_id);
        query = `SELECT nick_name FROM user WHERE uid = ${fromUserId}`;
        target = "nick_name";
      }
      item.title = await getTitle(query, target);
      newList.push(item);
    }
    Promise.all(newList).then(item => {
      alarm.list = item;
      io.to(`${socketId}`).emit("getNoti", alarm);
    }).catch(err => console.log(err));
  });
}

function getTitle (query, target) {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, rows) => {
      if (!err) {
        resolve(rows[0][target]);
      } else {
        console.log("2번", err);
        reject(err);
      }
    });
  });
};

function getFromUser (uid, contentId) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM message_group WHERE uid = ${contentId}`, (err, rows) => {
      if (!err) {
        resolve(rows[0].to_user_id === uid ? rows[0].from_user_id : rows[0].to_user_id);
      } else {
        console.log("2번", err);
        reject(err);
      }
    });
  });
}

exports.SendAlarm = (socketId, uid, contentId, message, io, fromUserId) => {
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
    .then(count => sendAlarm(socketId, uid, count, io, fromUserId))
    .catch();
};

exports.GetAlarm = (socketId, uid, io) => {
  countAlarm(uid)
    .then(count => sendAlarm(socketId, uid, count, io))
    .catch();
}
