const connection = require("../configs/connection");

function countAlarm (uid) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT count(confirm) FROM alarm WHERE user_id = ${uid} AND confirm = 0`,
      (err, rows) => {
        if (!err) {
          resolve(rows[0]["count(confirm)"]);
        } else {
          //console.log("2번", err);
          reject(err);
        }
      }
    );
  });
}

function sendAlarm (socketId, uid, count, io) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM alarm WHERE user_id = ${uid} ORDER BY create_time DESC`,
      (err, rows) => {
        if (!err) {
          addTitle(socketId, { count, list: rows }, io, uid);
        } else {
          //console.log("2번", err);
          reject(err);
        }
      }
    );
  });
}

function addTitle (socketId, alarm, io, uid) {
  return new Promise(async (resolve, reject) => {
    let newList = [];
    for (let item of alarm.list) {
      let query = null;
      let target = null;
      let isDesign = 1;
      if (item.type === "MESSAGE") {
        query = `SELECT nick_name FROM user WHERE uid = ${item.from_user_id}`;
        target = "nick_name";
      } else if (item.type === "DESIGN") {
        isDesign = await DoesItExistDesign(item.content_id);
        query = `SELECT title FROM design WHERE uid = ${item.content_id}`;
        target = "title";
      } else if (item.type === "GROUP") {
        isDesign = await DoesItExistGroup(item.content_id);
        query = `SELECT title FROM opendesign.group WHERE uid = ${
          item.content_id
        }`;
        target = "title";
      }
      if (isDesign) {
        item.title = await getTitle(query, target);
      } else {
        continue;
      }
      item.fromUser = await getNickName(item.from_user_id);
      newList.push(item);
      //console.log("newList", newList);
    }
    Promise.all(newList)
      .then(item => {
        //console.log(socketId, alarm);
        alarm.list = item;
        io.to(`${socketId}`).emit("getNoti", alarm);
      })
      .catch(err => console.log(err));
  });
}

function DoesItExistDesign (uid) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT count(uid) FROM design WHERE uid = ${uid}`,
      (err, rows) => {
        if (!err) {
          resolve(rows[0]["count(uid)"]);
        } else {
          //console.log("2번", err);
          reject(err);
        }
      }
    );
  });
}
function DoesItExistGroup (uid) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT count(uid) FROM opendesign.group WHERE uid = ${uid}`,
      (err, rows) => {
        if (!err) {
          resolve(rows[0]["count(uid)"]);
        } else {
          //console.log("2번", err);
          reject(err);
        }
      }
    );
  });
}

function getTitle (query, target) {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, rows) => {
      if (!err && rows.length > 0) {
        resolve(rows[0][target]);
      } else if (!err && rows.length) {
        resolve(null);
      } else {
        //console.log("3번", err);
        reject(err);
      }
    });
  });
}

function getNickName (uid) {
  return new Promise((resolve, reject) => {
    if (uid == null) resolve(null);
    connection.query(
      `SELECT nick_name FROM user WHERE uid = ${uid}`,
      (err, rows) => {
        if (!err && rows.length > 0) {
          resolve(rows[0].nick_name);
        } else if (rows.length) {
          resolve(null);
        } else {
          //console.log("1번", err);
          reject(err);
        }
      }
    );
  });
}

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
  } else if (message === "JoinGroup") {
    type = "GROUP";
    kinds = "JOIN";
  } else if (message === "JoinGroupSuccess") {
    type = "GROUP";
    kinds = "JOINSUCCESS";
  } else if (message === "JoinGroupRefuse") {
    type = "GROUP";
    kinds = "JOINREFUSE";
  } else if (message === "Likedesign") {
    type = "DESIGN";
    kinds = "LIKE";
  }

  function insertAlarm (uid, type, kinds, content_id, fromUserId) {
    return new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO alarm SET ?",
        {
          user_id: uid,
          type,
          kinds,
          content_id,
          from_user_id: fromUserId,
          confirm: 0
        },
        (err, rows) => {
          if (!err) {
            resolve(true);
          } else {
            //console.log("2번", err);
            reject(err);
          }
        }
      );
    });
  }

  insertAlarm(uid, type, kinds, contentId, fromUserId)
    .then(() => countAlarm(uid))
    .then(count => sendAlarm(socketId, uid, count, io))
    .catch();
};

exports.GetAlarm = (socketId, uid, io) => {
  //console.log("?????");
  countAlarm(uid)
    .then(count => sendAlarm(socketId, uid, count, io))
    .catch();
};
