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
        query = `SELECT nick_name FROM user WHERE uid = ${item.from_user_id}`;
        target = "nick_name";
      } else if (item.type === "DESIGN") {
        query = `SELECT title FROM design WHERE uid = ${item.content_id}`;
        target = "title";
      }
      item.title = await getTitle(query, target);
      item.fromUser = await getNickName(item.from_user_id);
      newList.push(item);
    }
    Promise.all(newList).then(item => {
      console.log(socketId, alarm);
      alarm.list = item;
      io.to(`${socketId}`).emit("getNoti", alarm);
    }).catch(err => console.log(err));
  });
}

function getTitle (query, target) {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, rows) => {
      if (!err && rows.length > 0) {
        resolve(rows[0][target]);
      } else if (rows.length) {
        resolve(null);
      } else {
        console.log("2번", err);
        reject(err);
      }
    });
  });
};

function getNickName (uid) {
  return new Promise((resolve, reject) => {
    if (uid == null) resolve(null);
    connection.query(`SELECT nick_name FROM user WHERE uid = ${uid}`, (err, rows) => {
      if (!err && rows.length > 0) {
        resolve(rows[0].nick_name);
      } else if (rows.length) {
        resolve(null);
      } else {
        console.log("2번", err);
        reject(err);
      }
    });
  });
};

exports.SendAlarm = (socketId, uid, contentId, message, fromUserId, io) => {
  let type = null;
  let kinds = null;
  if (message === "ReceiveMsg") {
    type = "MESSAGE";
    kinds = "SEND";
  } else if (message === "DesignInvite") {
    type = "DESIGN";
    kinds = "INVITE";
  } else if (message === "DesignRequest") {
    type = "DESIGN";
    kinds = "REQUEST";
  } else if (message === "DesignInvitedTrue") {
    type = "DESIGN";
    kinds = "INVITE_TRUE";
  } else if (message === "DesignRequestTrue") {
    type = "DESIGN";
    kinds = "REQUEST_TRUE";
  } else if (message === "DesignRefuse") {
    type = "DESIGN";
    kinds = "REFUSE";
  }

  function insertAlarm (uid, type, kinds, content_id, fromUserId) {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO alarm SET ?", {user_id: uid, type, kinds, content_id, from_user_id: fromUserId, confirm: 0}, (err, rows) => {
        if (!err) {
          resolve(true);
        } else {
          console.log("2번", err);
          reject(err);
        }
      });
    });
  }

  insertAlarm(uid, type, kinds, contentId, fromUserId)
    .then(() => countAlarm(uid))
    .then(count => sendAlarm(socketId, uid, count, io))
    .catch();
};

exports.GetAlarm = (socketId, uid, io) => {
  console.log("?????");
  countAlarm(uid)
    .then(count => sendAlarm(socketId, uid, count, io))
    .catch();
}
