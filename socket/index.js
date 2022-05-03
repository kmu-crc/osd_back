const socketio = require("socket.io");
const connection = require("../configs/connection");
require("dotenv").config();
const { SendAlarm, newGetMsg, newGetAlarm } = require("./SendAlarm");
const { SendMsg, CheckOpponentConnected } = require("./Chatting");
const { WServer } = require("../bin/www");
const SEC = 1000;
let sockets = [];
setInterval(()=>{ console.log("socks: ",sockets.length) }, 30*SEC)
console.log('socket server on');
const io = socketio(WServer, { 
cors: {
	origin: "http://market.opensrcdesign.com/",
	method: ["GET", "POST"]
}
});

const SocketConnection = () => {
  io.on("connection", socket => {
	console.log({socket});
  });
}

// //채팅 상대가 접속해있는지 확인
// exports.checkOpponentConnected = (socketId, uid, myUserId) => {
//   CheckOpponentConnected(socketId, uid, myUserId, io);
//   return new Promise((resolve, reject) => {
//     resolve();
//   });
// }
// exports.sendMessage = (socketId, uid, groupId) => {
//   SendMsg(socketId, uid, io, groupId);
// }
// 
// exports.sendAlarm = (socketId, uid, contentId, message, fromUserId, subContentId = null) => {
//   SendAlarm(socketId, uid, contentId, message, fromUserId, io, subContentId);
// };
// 
// exports.getAlarm = (socketId, uid) => {
//   newGetAlarm(socketId, uid, io);
// };
// 
// 
// const SendAlarm2 = obj => {
//   return new Promise((resolve, reject) => {
//     getAlarmDB(obj.user_id)
//       .then(alarms =>
//         obj.io.to(obj.socket).emit("get-alarm", alarms))
//       .then(
//         resolve(true))
//       .catch(err =>
//         reject(err));
//   });
// };
// const SendAlarmOnLive = obj => {
//   const getSocketid = uid => {
//     return new promise((resolve, reject) => {
//       connection.query(
//         `select socket_id from market.user where uid = ${uid}`,
//         (err, row) => {
//           if (!err && row.length === 0) {
//             resolve(null);
//           } else if (!err && row.length > 0) {
//             console.log("socket id:", row[0], row[0].socket_id);
//             resolve(row[0] ? row[0].socket_id : null);
//           } else {
//             console.error(err);
//             reject(err);
//           }
//         }
//       );
//     });
//   };
//   console.log(":::",obj);
//   getsocketid(obj.user_id)
//     .then(socket =>
//       SendAlarm2({ user_id: obj.user_id, socket: socket, io: io }));
// }
// 
// 
// exports.NewAlarm = obj => {
//   //  { type: 'ITEM_PURCHASED_TO_USER', to: 6, item_id: 111 }
//   //  { type: 'ITEM_PURCHASED_TO_EXPERT', from: 6, to: 1, item_id: 111 }
//   return new Promise((resolve, reject) => {
//     insertAlarmDB(obj)
//       .then(SendAlarmOnLive({ user_id: obj.to }))
//       .then(resolve(true))
//       .catch(err => reject(err));
//   });
// };
// 
// const getItemThumbnailByItemId = (id) => {
//   return new Promise((resolve, reject) => {
//     const sql = `SELECT m_img FROM market.thumbnail WHERE uid IN(SELECT thumbnail_id FROM market.item WHERE uid=${id})`;
//     connection.query(sql, (err, row) => {
//       if (!err) {
//         resolve(row[0]);
//       } else {
//         console.error(err);
//         reject(err);
//       }
//     });
//   });
// };
// const getItemNameByItemId = (id) => {
//   return new Promise((resolve, reject) => {
//     const sql = `SELECT title FROM market.item WHERE uid =${id}`;
//     connection.query(sql, (err, row) => {
//       if (!err) {
//         resolve(row[0]);
//       } else {
//         console.error(err);
//         reject(err);
//       }
//     });
//   });
// };
// const getUserThumbnailByUserId = (id) => {
//   return new Promise((resolve, reject) => {
//     const sql = `SELECT m_img FROM market.thumbnail WHERE uid IN(SELECT thumbnail FROM market.user WHERE uid=${id})`;
//     connection.query(sql, (err, row) => {
//       if (!err) {
//         resolve(row[0]);
//       } else {
//         console.error(err);
//         reject(err);
//       }
//     });
//   });
// };
// const getUserNameByUserId = (id) => {
//   return new Promise((resolve, reject) => {
//     const sql = `SELECT nick_name FROM market.user WHERE uid=${id}`;
//     connection.query(sql, (err, row) => {
//       if (!err) {
//         resolve(row[0]);
//       } else {
//         console.error(err);
//         reject(err);
//       }
//     });
//   });
// };
// const insertAlarmDB = async (obj) => {
//   let content = {};
//   if (obj.to) {
//     content.toName = await getUserNameByUserId(obj.to);
//     content.toThumbnail = await getUserThumbnailByUserId(obj.to);
//   }
//   if (obj.from) {
//     content.fromName = await getUserNameByUserId(obj.from);
//     content.fromThumbnail = await getUserThumbnailByUserId(obj.from);
//   }
//   if (obj.item_id) {
//     content.itemId = obj.item_id;
//     content.itemName = await getItemNameByItemId(obj.item_id);
//     content.itemThumbnail = await getItemThumbnailByItemId(obj.item_id);
//     delete obj.item_id;
//   }
//   obj.content = JSON.stringify(content);
//   return new Promise((resolve, reject) => {
//     const sql = `INSERT INTO market.alarm2 SET ?`
//     // console.log(sql, obj);
//     connection.query(sql, obj, (err, row) => {
//       if (!err) {
//         resolve(row.insertId);
//       } else {
//         console.error(err);
//         reject(err);
//       }
//     });
//   });
// };
// const getAlarmDB = (user_id) => {
//   return new Promise((resolve, reject) => {
//     const sql = `SELECT * FROM market.alarm2 A WHERE A.to=? ORDER BY A.confirm ASC, A.create_time DESC`;
//     connection.query(sql, user_id, (err, row) => {
//       if (!err) {
//         // console.log(row);
//         resolve(row);
//       } else {
//         console.error(err);
//         reject(err);
//       }
//     });
//   });
// };
 
 exports.SocketConnection = SocketConnection;
