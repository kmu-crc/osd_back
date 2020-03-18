const socketIO = require("socket.io");
const connection = require("../configs/connection");
require("dotenv").config();
const { SendAlarm, newGetMsg, newGetAlarm } = require("./SendAlarm");
const { SendMsg, CheckOpponentConnected } = require("./Chatting");

const { WServer } = require("../bin/www");

const io = socketIO(WServer);
let sockets = [];

function SocketConnection() {
  // This is what the socket.io syntax is like, we will work this later
  io.on("connection", socket => {
    //console.log("New client connected");
    sockets.push(socket);

    socket.on("INIT", (uid) => {
      //console.log("socket", uid, socket.id);
      connection.query(`UPDATE market.user SET ? WHERE uid=${uid}`, { socket_id: socket.id }, (err, rows) => {
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
      connection.query(`UPDATE market.user SET ? WHERE uid=${uid}`, { socket_id: socket.id }, (err, rows) => {
        if (!err) {
          // //console.log(rows);
        } else {
          //console.log("2번", err);
        }
      })
    })

    socket.on("confirm", (obj) => {
      connection.query(`UPDATE alarm SET ? WHERE uid=${obj.alarmId}`, { confirm: 1 }, (err, rows) => {
        if (!err) {
          newGetAlarm(socket.id, obj.uid, io);
        } else {
          //console.log("2번", err);
        }
      })
    })

    socket.on("allConfirm", (obj) => {
      connection.query(`UPDATE opendesign.alarm T SET T.confirm = 1 
        WHERE (user_id=${obj.user_id}) AND NOT((T.type = "MESSAGE") OR (T.type = "DESIGN" AND T.kinds = "INVITE") OR (T.type = "DESIGN" AND T.kinds = "REQUEST") OR (T.type = "GROUP" AND (T.kinds = "JOIN_withDESIGN" || T.kinds = "JOIN_widthGROUP") AND T.type = "MESSAGE"))`, (err, row) => {
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
      connection.query(`UPDATE market.user SET ? WHERE socket_id='${socket.id}'`, { socket_id: null }, (err, rows) => {
        if (!err) {
          sockets.splice(sockets.indexOf(socket), 1);
          // console.log("disconnected");
          sockets.map(soc => {
            // console.log("aaaaaaaa");
            soc.emit("SOMEONE-LOGOUT");
          })
        } else {
          console.error("socket-disconnect-error: ", err);
        }
      });
    });

    // ITEM
    socket.on("REQUEST-THIS-ITEM-MEMBER", item_id => {
      const sql = `
      SELECT
        U.uid, U.nick_name, T.m_img
      FROM
        market.user U
      LEFT JOIN
        market.thumbnail T ON T.uid = U.thumbnail
      WHERE 
        U.uid IN (SELECT user_id FROM market.member WHERE item_id=${item_id}) AND socket_id IS NOT NULL;`;
      connection.query(sql, (err, row) => {
        if (!err) {
          // console.log(row);
          sockets.map(soc => {
            soc.emit("GET-ONLINE-MEMBER", row);
          });
        } else {
          console.error(err);
        }
      });
    });
  });
}
//채팅 상대가 접속해있는지 확인
exports.checkOpponentConnected = (socketId, uid, myUserId) => {
  CheckOpponentConnected(socketId, uid, myUserId, io);
  return new Promise((resolve, reject) => {
    resolve();
  });
}
exports.sendMessage = (socketId, uid, groupId) => {
  SendMsg(socketId, uid, io, groupId);
}

exports.sendAlarm = (socketId, uid, contentId, message, fromUserId, subContentId = null) => {
  SendAlarm(socketId, uid, contentId, message, fromUserId, io, subContentId);
};

exports.getAlarm = (socketId, uid) => {
  newGetAlarm(socketId, uid, io);
};

exports.SocketConnection = SocketConnection;
