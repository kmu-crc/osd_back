const socketIO = require("socket.io");
const connection = require("../configs/connection");
require("dotenv").config();
const { GetNotification } = require("./Header");
const { SendAlarm, GetAlarm } = require("./SendAlarm");

const { WServer } = require("../bin/www");

const io = socketIO(WServer);

function SocketConnection () {
  console.log("WServer", WServer);
  // This is what the socket.io syntax is like, we will work this later
  io.on("connection", socket => {
    console.log("New client connected");
    socket.on("INIT", (uid) => {
      connection.query(`UPDATE user SET ? WHERE uid=${uid}`, {socket_id: socket.id}, (err, rows) => {
        if (!err) {
          GetAlarm(socket.id, uid, io);
        } else {
          console.log("2번", err);
        }
      });
    });

    socket.on("live socket id", (uid) => {
      // console.log(uid, socket.id);
      connection.query(`UPDATE user SET ? WHERE uid=${uid}`, {socket_id: socket.id}, (err, rows) => {
        if (!err) {
          // console.log(rows);
        } else {
          console.log("2번", err);
        }
      });
    });

    // disconnect is fired when a client leaves the server
    socket.on("disconnect", () => {
      connection.query(`UPDATE user SET ? WHERE socket_id='${socket.id}'`, {socket_id: null}, (err, rows) => {
        if (!err) {
          console.log("socket disconnect SUCCESS");
        } else {
          console.log("2번", err);
        }
      });
    });
  });
};

exports.sendAlarm = (socketId, uid, contentId, message) => {
  SendAlarm(socketId, uid, contentId, message, io);
};

exports.SocketConnection = SocketConnection;
