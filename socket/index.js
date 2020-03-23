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
    // socket.on("INIT", (uid) => {
    //   //console.log("socket", uid, socket.id);
    //   connection.query(`UPDATE market.user SET ? WHERE uid=${uid}`, { socket_id: socket.id }, (err, rows) => {
    //     if (!err) {
    //       // GetAlarm(socket.id, uid, io);
    //       newGetAlarm(socket.id, uid, io)
    //     } else {
    //       //console.log("2번", err);
    //     }
    //   });
    // })
    // socket.on("confirm", (obj) => {
    //   connection.query(`UPDATE alarm SET ? WHERE uid=${obj.alarmId}`, { confirm: 1 }, (err, rows) => {
    //     if (!err) {
    //       newGetAlarm(socket.id, obj.uid, io);
    //     } else {
    //       //console.log("2번", err);
    //     }
    //   })
    // })
    // socket.on("allConfirm", (obj) => {
    //   connection.query(`UPDATE opendesign.alarm T SET T.confirm = 1 
    //     WHERE (user_id=${obj.user_id}) AND NOT((T.type = "MESSAGE") OR (T.type = "DESIGN" AND T.kinds = "INVITE") OR (T.type = "DESIGN" AND T.kinds = "REQUEST") OR (T.type = "GROUP" AND (T.kinds = "JOIN_withDESIGN" || T.kinds = "JOIN_widthGROUP") AND T.type = "MESSAGE"))`, (err, row) => {
    //     if (!err) {
    //       newGetAlarm(socket.id, obj.user_id, io)
    //     }
    //   })
    // })
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
    //ALARM
    socket.on("INIT", (uid) => {
      //console.log("socket", uid, socket.id);
      connection.query(`UPDATE market.user SET ? WHERE uid=${uid}`, { socket_id: socket.id }, (err, _) => {
        if (!err) {
          SendAlarm2({ io: io, socket: socket.id, user_id: uid });
        } else {
          console.error("SOCKET INIT ERROR:", err);
        }
      })
    });
    socket.on("confirm", (obj) => {
      const sql = `UPDATE market.alarm2 SET ? WHERE uid=${obj.alarmId}`;
      console.log(sql);
      connection.query(sql, { confirm: 1 }, (err, _) => {
        if (!err) {
          newGetAlarm(socket.id, obj.uid, io);
        } else {
          console.error("SOCKET ALARM CONFIRM ERROR:", err);
        }
      })
    });
    socket.on("allConfirm", (obj) => {
      connection.query(`UPDATE market.alarm2 T SET T.confirm = 1 WHERE (T.to=?);`, obj.user_id, (err, _) => {
        if (!err) {
          newGetAlarm(socket.id, obj.user_id, io)
        } else {
          console.error("SOCKET ALARM ALL CONFIRM ERROR:", err);
        }
      })
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


const SendAlarm2 = obj => {
  return new Promise((resolve, reject) => {
    getAlarmDB(obj.user_id)
      .then(alarms =>
        obj.io.to(obj.socket).emit("get-alarm", alarms))
      .then(
        resolve(true))
      .catch(err =>
        reject(err));
  });
};
const SendAlarmOnLive = obj => {
  const getSocketId = uid => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT socket_id FROM market.user WHERE uid = ${uid}`,
        (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            console.log("socket id:", row[0].socket_id);
            resolve(row[0] ? row[0].socket_id : null);
          } else {
            console.error(err);
            reject(err);
          }
        }
      );
    });
  };
  getSocketId(obj.user_id)
    .then(socket =>
      SendAlarm2({ user_id: obj.user_id, socket: socket, io: io }));
}


exports.NewAlarm = obj => {
  //  { type: 'ITEM_PURCHASED_TO_USER', to: 6, item_id: 111 }
  //  { type: 'ITEM_PURCHASED_TO_EXPERT', from: 6, to: 1, item_id: 111 }
  return new Promise((resolve, reject) => {
    insertAlarmDB(obj)
      .then(SendAlarmOnLive({ user_id: obj.to }))
      .then(resolve(true))
      .catch(err => reject(err));
  });
};

const getItemThumbnailByItemId = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT m_img FROM market.thumbnail WHERE uid IN(SELECT thumbnail_id FROM market.item WHERE uid=${id})`;
    connection.query(sql, (err, row) => {
      if (!err) {
        resolve(row[0]);
      } else {
        console.error(err);
        reject(err);
      }
    });
  });
};
const getItemNameByItemId = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT title FROM market.item WHERE uid =${id}`;
    connection.query(sql, (err, row) => {
      if (!err) {
        resolve(row[0]);
      } else {
        console.error(err);
        reject(err);
      }
    });
  });
};
const getUserThumbnailByUserId = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT m_img FROM market.thumbnail WHERE uid IN(SELECT thumbnail FROM market.user WHERE uid=${id})`;
    connection.query(sql, (err, row) => {
      if (!err) {
        resolve(row[0]);
      } else {
        console.error(err);
        reject(err);
      }
    });
  });
};
const getUserNameByUserId = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT nick_name FROM market.user WHERE uid=${id}`;
    connection.query(sql, (err, row) => {
      if (!err) {
        resolve(row[0]);
      } else {
        console.error(err);
        reject(err);
      }
    });
  });
};
const insertAlarmDB = async (obj) => {
  let content = {};
  if (obj.to) {
    content.toName = await getUserNameByUserId(obj.to);
    content.toThumbnail = await getUserThumbnailByUserId(obj.to);
  }
  if (obj.from) {
    content.fromName = await getUserNameByUserId(obj.from);
    content.fromThumbnail = await getUserThumbnailByUserId(obj.from);
  }
  if (obj.item_id) {
    content.itemId = obj.item_id;
    content.itemName = await getItemNameByItemId(obj.item_id);
    content.itemThumbnail = await getItemThumbnailByItemId(obj.item_id);
    delete obj.item_id;
  }
  obj.content = JSON.stringify(content);
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO market.alarm2 SET ?`
    // console.log(sql, obj);
    connection.query(sql, obj, (err, row) => {
      if (!err) {
        resolve(row.insertId);
      } else {
        console.error(err);
        reject(err);
      }
    });
  });
};
const getAlarmDB = (user_id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM market.alarm2 A WHERE A.to=? ORDER BY A.confirm ASC, A.create_time DESC`;
    connection.query(sql, user_id, (err, row) => {
      if (!err) {
        // console.log(row);
        resolve(row);
      } else {
        console.error(err);
        reject(err);
      }
    });
  });
};

exports.SocketConnection = SocketConnection;
