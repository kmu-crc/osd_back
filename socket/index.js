const socketIO = require("socket.io");
const connection = require("../configs/connection");
require("dotenv").config();
const { SendAlarm, newGetMsg, newGetAlarm } = require("./SendAlarm");

const { WServer } = require("../bin/www");

const io = socketIO(WServer);

exports.getSocketId = uid => {
  return new Promise((resolve, reject) => {
    console.log("uid", uid);
    connection.query(
      `SELECT socket_id FROM user WHERE uid = ${uid}`,
      (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          resolve({ socketId: row[0].socket_id });
        } else {
          console.log(err);
          reject(err);
        }
      }
    );
  });
};


function SocketConnection() {
  // This is what the socket.io syntax is like, we will work this later
  io.on("connection", socket => {
    //console.log("New client connected");
    socket.on("INIT", (uid) => {
      //console.log("socket", uid, socket.id);
      connection.query(`UPDATE user SET ? WHERE uid=${uid}`, { socket_id: socket.id }, (err, rows) => {
        if (!err) {
          // GetAlarm(socket.id, uid, io);
          newGetAlarm(socket.id, uid, io)
        } else {
          //console.log("2번", err);
        }
      });
    })

    socket.on("live socket id", (uid) => {
      // //console.log(uid, socket.id);
      connection.query(`UPDATE user SET ? WHERE uid=${uid}`, { socket_id: socket.id }, (err, rows) => {
        if (!err) {
          // //console.log(rows);
        } else {
          //console.log("2번", err);
        }
      })
    })

    socket.on("confirm", (obj) => {
    const query = `UPDATE alarm SET ? WHERE uid=${obj.alarmId}`;
    //console.log(url);
      connection.query(query, { confirm: 1 }, (err, rows) => {
        if (!err) {
          newGetAlarm(socket.id, obj.user_id, io);
        } else {
          //console.log("2번", err);
        }
      })
    })

    socket.on("allConfirm", (obj) => {
    const url = `UPDATE opendesign.alarm T SET T.confirm = 1 
        WHERE (user_id=${obj.user_id}) AND NOT((T.type = "MESSAGE") OR (T.type = "DESIGN" AND T.kinds = "INVITE") OR (T.type = "DESIGN" AND T.kinds = "REQUEST") OR (T.type = "GROUP" AND (T.kinds = "JOIN_withDESIGN" || T.kinds = "JOIN_widthGROUP") AND T.type = "MESSAGE"))`
//console.log("all confirm query - ", url)
      connection.query(url, (err, row) => {
          if (!err) {
            newGetAlarm(socket.id, obj.user_id, io)
          }
        })
    })

    socket.on("requestMsgAlarm", (uid) => {
      newGetMsg(socket.id, uid, io)
    })

    socket.on("confirmMsgAlarm", (obj) => {
      connection.query(`UPDATE opendesign.alarm T SET T.confirm = 1 WHERE T.user_id=${obj.uid} AND T.from_user_id=${obj.fromID}`, (err, rows) => {
        if (!err) {
          newGetAlarm(socket.id, obj.uid, io)
        }
      })
    })
    // disconnect is fired when a client leaves the server
    socket.on("disconnect", () => {
      connection.query(`UPDATE user SET ? WHERE socket_id='${socket.id}'`, { socket_id: null }, (err, rows) => {
        if (!err) {
          //console.log("socket disconnect SUCCESS");
        } else {
          //console.log("2번", err);
        }
      });
    })
  })
}


exports.sendAlarm = (socketId, uid, contentId, message, fromUserId, subContentId) => {
  SendAlarm(socketId, uid, contentId, message, fromUserId, io, subContentId);
};

exports.getAlarm = (socketId, uid) => {
  newGetAlarm(socketId, uid, io);
};

exports.SocketConnection = SocketConnection;
