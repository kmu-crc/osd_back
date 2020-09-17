const socketIO = require("socket.io");
const connection = require("../configs/connection");
const { SendAlarm, newGetMsg, newGetAlarm } = require("./SendAlarm");
const { WServer } = require("../bin/www");
const io = socketIO(WServer);

require("dotenv").config();

let chatrooms = [];
let chatRoomAndMems = [];
// let videorooms = [];
// let videoRoomAndMems = [];

// for DB
const readMessage = (obj) => {
  return new Promise((resolve, reject) => {
    const deleteCount = () => {
      return new Promise((resolve, reject) => {
        const sql = `
          DELETE FROM 
            opendesign.design_chat_read_count 
          WHERE 
            user_id=${obj.user_id} 
            AND 
            design_id=${obj.design_id}
        `;

        connection.query(sql, (err, _) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    }
    deleteCount()
      .then(resolve)
      .catch(reject);
  });
};
const loadMessage = (obj) => {
  return new Promise((resolve, reject) => {
    const { page, design_id } = obj;
    const sql = `
      SELECT DC.*, U.nick_name AS \`memberName\`
        FROM opendesign.design_chat DC
        LEFT JOIN opendesign.user U ON DC.user_id = U.uid
          WHERE design_id=${design_id}
            ORDER BY uid DESC LIMIT ${page * 10}, 10`;

    connection.query(sql, (err, row) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};
const newChatMessage = (obj) => {
  return new Promise((resolve, reject) => {
    const messageCounter = (id) => {
      return new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO 
            opendesign.design_chat_read_count(chat_msg_id, user_id, design_id)
          SELECT ${id} AS \`chat_msg_id\`, user_id, ${obj.design_id} AS \`design_id\`
            FROM opendesign.design_member 
          WHERE design_id=${obj.design_id} AND user_id != ${obj.user_id};`;
        connection.query(sql, obj, (err, _) => {
          if (err) {
            reject(err);
          } else {
            resolve(id);
          }
        });
      });
    }
    const newmessage = () => {
      return new Promise((resolve, reject) => {
        const sql = `INSERT INTO opendesign.design_chat SET ?`;
        connection.query(sql, obj, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.insertId);
          }
        });
      });
    }
    const loadSingleMessage = (id) => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT C.*, U.nick_name AS \`memberName\` FROM opendesign.design_chat C LEFT JOIN opendesign.user U ON U.uid = C.user_id WHERE C.uid=${id}`;
        connection.query(sql, (err, row) => {
          if (!err) {
            // console.log(row[0]);
            resolve(row[0]);
          } else {
            console.error(err);
            reject(err);
          }
        })
      })
    }
    newmessage()
      .then(id => messageCounter(id))
      .then(id => loadSingleMessage(id))
      .then(msg => appendReadCount([msg]))
      .then(msg => resolve(...msg))
      .catch(reject)
  })
};
const getTotalCountMessage = (obj) => {
  return new Promise((resolve, _) => {
    const newmessage = () => {
      return new Promise((resolve, _) => {
        const sql = `
          SELECT COUNT(*)
            FROM opendesign.design_chat_read_count
              WHERE design_id=${obj.design} AND user_id=${obj.user};
          `;
        connection.query(sql, obj, (err, row) => {
          if (err) {
            console.error('design chat count error:', err);
            // reject(0);
            resolve(0);
          } else {
            resolve(row[0] ? row[0]['COUNT(*)'] : 0);
          }
        })
      });
    }
    newmessage()
      .then(resolve)
    // .catch(reject)
  })
}
const appendReadCount = (obj) => {
  return new Promise((resolve, reject) => {
    const getReadCountOfMessage = (msg) => {
      return new Promise((resolve, reject) => {
        const sql = `
          SELECT COUNT(*) AS cnt 
          FROM opendesign.design_chat_read_count 
          WHERE chat_msg_id=${msg.uid};
        `;
        connection.query(sql, (err, row) => {
          if (!err) {
            resolve(row ? row[0]['cnt'] : 0);
          } else {
            reject(err);
          }
        })
      });
    }
    Promise.all(
      obj.map(async ele => {
        ele.count = await getReadCountOfMessage(ele);
        // console.log(ele.count);
        return ele;
      }))
      .then(resolve)
      .catch(reject);
  });
};
const appendThumbnail = (obj) => {
  return new Promise((resolve, reject) => {
    const getThumbnailOfMessage = (msg) => {
      return new Promise((resolve, reject) => {
        const sql = `
          SELECT s_img AS \`thumbnail\` 
            FROM opendesign.thumbnail
              WHERE uid IN 
                (SELECT thumbnail FROM opendesign.user where uid=${msg.user_id});
        `;
        connection.query(sql, (err, row) => {
          if (!err) {
            resolve(row ? row[0]['thumbnail'] : "");
          } else {
            reject(err);
          }
        })
      });
    }
    Promise.all(
      obj.map(async ele => {
        ele.thumbnail = await getThumbnailOfMessage(ele);
        return ele;
      }))
      .then(resolve)
      .catch(reject);
  });
}
const getNickName = (user_id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT nick_name FROM opendesign.user WHERE uid=${user_id};`
    connection.query(sql, (err, row) => {
      if (!err) {
        resolve(row ? row[0]["nick_name"] : "");
      } else {
        console.error(err);
        reject(err);
      }
    });
  });
}
const getTotalMessage = (obj) => {
  return new Promise((resolve, reject) => {
    const chat = () => {
      return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM opendesign.design_chat WHERE design_id=${obj.design_id} ORDER BY uid ASC`;
        connection.query(sql, (err, row) => {
          if (!err) {
            resolve(row);
          } else {
            console.error(err);
            reject(err);
          }
        });
      })
    }
    chat()
      .then(list =>
        Promise.all(
          list.map(async ele => {
            ele.nick_name = await getNickName(ele.user_id);
            return ele;
          })
        )
          .then(resolve)
          .catch(reject)
      )
      .catch(reject);
  })
};
const loadMessageUnread = (obj) => {
  console.log(obj);
  return new Promise((resolve, reject) => {
    const sql = `SELECT chat_msg_id, COUNT(*) AS count
    FROM opendesign.design_chat_read_count
    WHERE 
    chat_msg_id 
      IN (
        SELECT uid FROM opendesign.design_chat 
          WHERE design_id=${obj.design_id}) GROUP BY chat_msg_id`;
    connection.query(sql, (err, row) => {
      if (!err) {
        resolve(row);
      } else {
        console.error(err);
        reject(err);
      }
    })
  });
}

exports.getSocketId = uid => {
  return new Promise((resolve, reject) => {
    // console.log("uid", uid);
    connection.query(
      `SELECT socket_id FROM user WHERE uid=${uid}`,
      (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          resolve({ socketId: row[0].socket_id });
        } else {
          console.error(err);
          reject(err);
        }
      }
    );
  });
};

const updateSocket = (socketId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE
        opendesign.user
      SET
        ? 
      WHERE 
        uid = ${userId}`;
    connection.query(
      sql, { socket_id: socketId },
      (err, row) => {
        if (!err) {
          resolve(true);
        }
        else {
          console.error(err);
          reject(err);
        }
      });
  });
}

function SocketConnection() {
  // This is what the socket.io syntax is like, we will work this later
  io
    // .of("/opendesign")
    .on("connection", socket => {
      // console.log("basic socket connected");
      socket.on("INIT", (uid) => {
        // console.log("init - send alarms", uid, socket.id);
        connection.query(`UPDATE user SET ? WHERE uid=${uid}`, { socket_id: socket.id }, (err, rows) => {
          if (!err) {
            // GetAlarm(socket.id, uid, io);
            newGetAlarm(socket.id, uid, io)
          } else {
            //console.log("2번", err);
          }
        });
      })

      // for chat
      socket.on('design-init', data => {
        getTotalCountMessage(data)
          .then(cnt => {
            io.emit("check-new-message-count", cnt);
          })
      })
      // for vchat
      socket.on('invited-member-to-vchat', data => {
        const get_design_member = (obj) => {
          return new Promise(resolve => {
            const sql = `
            SELECT 
              * 
            FROM 
              opendesign.design_member 
            WHERE 
              design_id=${obj.design_id} AND user_id!=${obj.user_id}`;

            connection.query(sql, (err, row) => {
              if (!err) {
                resolve(row);
              } else {
                console.error("socket - vchat_alarm - get design member\n", err);
              }
            });
          });
        };

        get_design_member(data)
          .then(mem => {
            mem && mem.length > 0 && mem.map(user =>
              SendAlarm(socket.id, user.user_id, data.design_id,
                "OpenedVideoChat", data.user_id, io, null));
          });
      });

      socket.on("request-notification", uid => {
        const { sendNotification } = require("../routes/users/notification");
        updateSocket(socket.id, uid)
          .then(sendNotification(uid))
          .catch(err => console.error("ERROR:", err));
      });

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
        const url = `SET SQL_SAFE_UPDATES = 0;
        UPDATE opendesign.alarm T SET T.confirm = 1 
        WHERE (user_id=${obj.user_id}) AND !(T.type = "DESIGN" AND T.kinds = "INVITE") AND !(T.type = "MESSAGE");SET SQL_SAFE_UPDATES = 1;`
        // const url = `SET SQL_SAFE_UPDATES = 0;UPDATE opendesign.alarm T SET T.confirm = 1 
        //   WHERE (user_id=${obj.user_id}) AND T.type NOT LIKE "MESSAGE" OR (T.type = "DESIGN" AND T.kinds = "INVITE");SET SQL_SAFE_UPDATES = 1;`
        // WHERE (user_id=${obj.user_id}) AND NOT((T.type = "MESSAGE") OR (T.type = "DESIGN" AND T.kinds = "INVITE") OR (T.type = "DESIGN" AND T.kinds = "REQUEST") OR (T.type = "GROUP" AND (T.kinds = "JOIN_withDESIGN" || T.kinds = "JOIN_widthGROUP") AND T.type = "MESSAGE"))`
        // console.log("all confirm query - ", url)
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

  // socket communication
  io
    .of('/webrtcPeerChat')
    .on('connection', socket => {
      const { roomNum, memberName, memberId, thumbnail } = socket.handshake.query;
      // console.log("------chat socket connected-----", roomNum, memberName, memberId, thumbnail);

      if (!chatrooms.includes(roomNum)) {
        chatrooms.push(roomNum);
        // console.log("create room No.", roomNum, "rooms:", chatrooms);
        // let fetch = require("node-fetch");
        // console.log(url);
        //console.log(`room create on ${roomNum},rooms: ${rooms.map(room=>room)}`);
      }
      const pos = chatRoomAndMems.findIndex(e => e.id === memberId && e.room === roomNum);
      if (pos === -1) {
        chatRoomAndMems.push({ id: memberId, room: roomNum });
        socket.join(roomNum);
      } else {
        // console.log("already connected");
        // socket.emit('banned', () => { });
      }
      socket.on('notice', (data) => {
        // new notice message

      });
      socket.on('chat', (data) => {
        newChatMessage({
          "design_id": roomNum,
          "user_id": memberId,
          "message": data.message
        })
          .then(msg => {
            // design detail
            io.of('/').emit('chat', { design_id: roomNum, user_id: memberId });
            // design chat
            io.of('/webrtcPeerChat').in(roomNum).emit('chat', msg
              // message: data.message,
              // memberName: memberName,
              // user_id: memberId,
              // socketID: socket.id
            )
          })
          .catch(err => console.error("CHAT SAVE DB ERROR: ", err));
      });
      socket.on('read', () => {
        readMessage({ user_id: memberId, design_id: roomNum })
          .then(data => loadMessageUnread({ design_id: roomNum }))
          .then(unread => io.of('/webrtcPeerChat').to(roomNum).emit('read', unread))
          .catch(err => console.error(err));
        // .then(read =>
        // socket.to(roomNum).emit('read', { success: read, user_id: memberId }))
      });
      socket.on('load', data => {
        // console.log('load', data);
        loadMessage(data)
          .then(data =>
            appendReadCount(data))
          .then(data =>
            appendThumbnail(data))
          .then(data =>
            socket.emit('load', data))
          .catch(err =>
            socket.emit('load', { sucess: false, detail: err }));
      });
      socket.on('save-chat', async (obj) => {
        const data = await getTotalMessage(obj);
        socket.emit('save-chat', data);
      });
      socket.on('disconnect', () => {
        socket.leave(roomNum);
        const pos = chatRoomAndMems.findIndex(e => e.id === memberId && e.room === roomNum);
        pos > -1 ? chatRoomAndMems.splice(pos, 1) : null;
        //console.log(
        //  'disconnected socket: ',
        //  socket.id,
        //  memberName,
        //  socket.rooms,
        //  chatrooms,
        //  chatRoomAndMems);
      });
    });

  // let connectedPeers = new Map()
  // const peers = 
  // web에 연결된 peers에 대한 정보를 connectedPeers 정보로 저장
  // peers가 web에 connection이 되면
  // io
  //   .of('/webrtcPeer')
  //   .on('connection', socket => {
  //     const { memberId, roomNum } = socket.handshake.query;
  //     // console.log("video socket connected");
  //     // const { roomNum, memberId } = socket.handshake.query;
  //     //connectPeers에 connection된 peers의 socket 정보 추가
  //     connectedPeers.set(socket.id, socket)
  //     if (!videorooms.includes(roomNum)) {
  //       videorooms.push(roomNum);
  //       // console.log("create room No.", roomNum, "rooms:", videorooms);
  //       // let fetch = require("node-fetch");
  //       // console.log(url);
  //       //console.log(`room create on ${roomNum},rooms: ${rooms.map(room=>room)}`);
  //     }
  //     const pos = videoRoomAndMems.findIndex(e => e.id === memberId && e.room === roomNum);
  //     if (pos === -1) {
  //       videoRoomAndMems.push({ id: memberId, room: roomNum });
  //       socket.join(roomNum);
  //     } else {
  //       // console.log("already connected");
  //       // socket.emit('banned', () => { });
  //     }
  //     //server상에 connection된 peer의 socket id 띄우기
  //     // console.log('참여한 peer의 socket.id : ', socket.handshake.query, socket.id)
  //     //peers에게 연결 성공 data 전송
  //     socket.emit('connection-success', {
  //       success: socket.id,
  //       peerCount: connectedPeers.size,
  //     })
  //     //broadcast 정의
  //     const broadcast = () => socket.broadcast.emit('joined-peers', {
  //       peerCount: connectedPeers.size,
  //     })
  //     //connectedPeers의 크기를 통해 참석한 peers의 숫자 전송(peers에게)
  //     broadcast()
  //     //disconnectedPeer 정의 
  //     const disconnectedPeer = (socketID) => socket.broadcast.emit('peer-disconnected', {
  //       socketID: socketID
  //     })
  //     //server에서 peers의 disconnect 수신 받으면 연결해제 log띄우기  
  //     //connectedPeers 변수에서 퇴장한 peer의 socket.id 삭제
  //     //disconnected 된 peer 정보 전송(peer에게)
  //     socket.on('disconnect', () => {
  //       // console.log('client가 화상회의에서 퇴장합니다', roomNum, memberId);
  //       connectedPeers.delete(socket.id);
  //       disconnectedPeer(socket.id);
  //       socket.leave(roomNum);
  //       const pos = videoRoomAndMems.findIndex(e => e.id === memberId && e.room === roomNum);
  //       pos > -1 ? videoRoomAndMems.splice(pos, 1) : null;
  //     })
  //     //server에서 onlinePeers에 대한 정보 수신 받으면
  //     socket.on('onlinePeers', (data) => {
  //       for (const [socketID, _socket] of connectedPeers.entries()) {
  //         // 자기 자신(local)이 아니라면(remote peer일 떄)
  //         if (socketID !== data.socketID.local && socket.request._query.roomNum === _socket.request._query.roomNum) {
  //           //online peer에 대한 정보 출력
  //           // if (socketID !== data.socketID.local) {
  //           // console.log('online-peer', data.socketID, socketID)
  //           //online peer에 대한 정보 peers에게 전송
  //           socket.emit('online-peer', socketID)
  //         }
  //       }
  //     })
  //     //server에서 offer event를 수신받으면
  //     socket.on('offer', (data) => {
  //       //connectedPeers에 해당되는 socket의 정보가 있을때
  //       for (const [socketID, socket] of connectedPeers.entries()) {
  //         // 자기 자신(local)이 아니라면(remote peer일 때)      
  //         // console.log(_socket.request._query.roomNum, socket.request._query.roomNum);
  //         if (socketID === data.socketID.remote) {
  //           //offer peer의 socket 정보 출력
  //           // console.log('Offer', socketID, data.socketID, data.payload.type)
  //           //offer peer의 sdp정보,socketID 전송(remote peer에게)
  //           socket.emit('offer', {
  //             sdp: data.payload,
  //             socketID: data.socketID.local
  //           }
  //           )
  //         }
  //       }
  //     })
  //     //server에서 answer event를 수신받으면
  //     socket.on('answer', (data) => {
  //       //connectedPeers에 해당되는 socket의 정보가 있을떄
  //       for (const [socketID, socket] of connectedPeers.entries()) {
  //         // 자기 자신(local)이 아니라면(remote peer일 떄)
  //         if (socketID === data.socketID.remote) {
  //           //answer peer의 socket 정보 출력
  //           // console.log('Answer', socketID, data.socketID, data.payload.type)
  //           //answer peer의 sdp정보,socketID 전송(offer 요청 peer에게)
  //           socket.emit('answer', {
  //             sdp: data.payload,
  //             socketID: data.socketID.local
  //           }
  //           )
  //         }
  //       }
  //     })
  //     //server에서 candidate event를 수신받으면  
  //     socket.on('candidate', (data) => {
  //       //connectedPeers에 해당되는 socket의 정보가 있을떄
  //       for (const [socketID, _socket] of connectedPeers.entries()) {
  //         // 자기 자신(local)이 아니라면(remote peer일 떄)
  //         if (socketID == data.socketID.remote) {
  //           const thumbnail = socket.request._query.thumbnail
  //           // console.log(thumbnail);
  //           setTimeout(() => { }, 1500);
  //           //candidate 연결할 peer의 socket 정보 출력
  //           // console.log(socketID, data.payload)
  //           //candidate,sockeID 전송(offer peer와 answer peer간에 connection이 완료됨)
  //           _socket.emit('candidate', {
  //             candidate: data.payload,
  //             socketID: data.socketID.local,
  //             thumbnail: thumbnail,
  //           })
  //         }
  //       }
  // })
  // })
}


exports.sendAlarm = (socketId, uid, contentId, message, fromUserId, subContentId) => {
  SendAlarm(socketId, uid, contentId, message, fromUserId, io, subContentId);
};

exports.getAlarm = (socketId, uid) => {
  newGetAlarm(socketId, uid, io);
};

exports.SocketConnection = SocketConnection;













// const chat = socketIO(WServer, { path: "/webrtc/socket.io" });
// const vchat = socketIO(WServer, { path: "/webrtc/socket.io" });
//
// SERVER
// var io = require('socket.io')(WServer, { path: '/opendesign/socket.io' });
// var io  = require('socket.io')(http, { path: '/myapp/socket.io'});
// io
// .of('/my-namespace')
// .on('connection', function(socket){
//     console.log('a user connected with id %s', socket.id);
//     socket.on('my-message', function (data) {
//         io.of('my-namespace').emit('my-message', data);
//         // or socket.emit(...)
//         console.log('broadcasting my-message', data);
//     });
// });
