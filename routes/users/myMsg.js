var connection = require("../../configs/connection");

exports.getChatRoomList = (req, res, next) => {
  const user_id = req.decoded.uid;
  const getRoomList = async (id) => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT G.uid, G.to_user_id, G.from_user_id, G.update_time, T.count FROM opendesign.message_group G
	      LEFT JOIN (
		      SELECT A.user_id, A.from_user_id, COUNT(*) AS 'count' FROM opendesign.alarm A 
            WHERE A.user_id=${id} AND A.type LIKE 'MESSAGE' AND A.confirm LIKE 0 GROUP BY A.from_user_id) AS T ON T.from_user_id = G.from_user_id
        WHERE 
					(G.to_user_id=${id} OR G.from_user_id=${id})
					AND
					(G.update_time >= NOW() - INTERVAL 3 MONTH)
				ORDER BY count DESC,G.update_time DESC;
      `;
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
  const getThumbnail = (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT m_img FROM opendesign.thumbnail WHERE uid IN (SELECT thumbnail FROM opendesign.user WHERE uid=${id})`;
      connection.query(sql, (err, row) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(row[0] ? row[0]["m_img"] : null);
        }
      });
    });
  };
  const addThumbnail = async list => {
    return new Promise((resolve, _) => {
      Promise.all(
        list.map(async item => {
          item.thumbnail = await getThumbnail(item.from_user_id === user_id ? item.to_user_id : item.from_user_id);
          return item;
        }))
        .then(resolve)
    });
  };
  const getRecentlyMessage = (from, to) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT message FROM opendesign.message M WHERE M.from_user_id=${from} AND M.to_user_id=${to} ORDER BY create_time DESC LIMIT 1`;
      connection.query(sql, (err, row) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(row[0] ? row[0]["message"] : null);
        }
      })
    });
  };
  const addRecentlyMessage = async list => {
    return new Promise((resolve, _) => {
      Promise.all(
        list.map(async item => {
          item.recent = await getRecentlyMessage(item.from_user_id, user_id) || await getRecentlyMessage(user_id, item.to_user_id);
          return item;
        }))
        .then(resolve);
    });
  };
  const getNickName = (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT nick_name FROM opendesign.user U WHERE uid=${id}`;
      connection.query(sql, (err, row) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(row[0] ? row[0]["nick_name"] : null);
        }
      })
    });
  };
  const addNickName = async list => {
    return new Promise((resolve, _) => {
      Promise.all(
        list.map(async item => {
          item.friend_name = await getNickName(item.from_user_id === user_id ? item.to_user_id : item.from_user_id);
          item.friend_id = item.from_user_id === user_id ? item.to_user_id : item.from_user_id;
          return item;
        }))
        .then(resolve);
    });
  };
  const success = rooms => { res.status(200).json({ success: true, rooms: rooms }); }
  const error = err => { res.status(500).json({ success: false, message: err }); }

  getRoomList(user_id)
    .then(addThumbnail)
    .then(addRecentlyMessage)
    .then(addNickName)
    .then(success)
    .catch(error)
}

exports.getMyMsgList = (req, res, next) => {
  const userId = req.decoded.uid;

  // 내가 주고 받은 메시지 id 가져오기
  async function getList(id) {
    let rows = new Promise((resolve, reject) => {
      const sql =
        `SELECT * FROM 
        (SELECT message_group.*,M.create_time,M.message,TH.s_img 
          FROM message_group LEFT JOIN message M ON message_group.uid = M.group_id LEFT JOIN thumbnail TH ON TH.uid IN (SELECT uid FROM thumbnail WHERE thumbnail.uid IN (SELECT opendesign.user.thumbnail FROM opendesign.user WHERE opendesign.user.uid = IF(message_group.to_user_id=${id},message_group.from_user_id,message_group.to_user_id)))WHERE create_time IN (SELECT MAX(create_time) FROM message GROUP BY group_id)) as T WHERE T.to_user_id=${id} OR T.from_user_id=${id}`
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          //console.log("w");
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row;
          //console.log("받은 메시지", row);
          resolve(data);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
    return rows.then(async data => {
      if (data === null) {
        return null;
      }
      for (let item of data) {
        if (item.from_user_id === userId) {
          const result = await getNameTo(item);
          item.friend_name = result.nick_name;
          item.friend_id = result.uid;
        } else {
          const result = await getNameFrom(item);
          item.noti = await getNotiNum(item);
          item.friend_name = result.nick_name;
          item.friend_id = result.uid;
        }
      }
      return data;
    });
  };
  async function getNotiNum(data) {
    return new Promise((resolve, reject) => {
      if (data === null) {
        resolve(null)
      } else {
        const sql = `SELECT count(confirm) 
        from alarm where user_id = ${data.to_user_id} AND alarm.type="MESSAGE" AND alarm.confirm=0
        AND alarm.from_user_id=${data.from_user_id}`
        connection.query(sql, (error, row) => {
          if (!error && row.length === 0) {
            resolve(null)
          } else if (!error && row.length > 0) {
            resolve(row[0]["count(confirm)"])
          } else {
            next(error)
          }
        })
      }
    })
  }
  // 보낸 사람 id&닉네임 가져오기
  async function getNameFrom(data) {
    return new Promise((resolve, reject) => {
      if (data === null) {
        resolve(null);
      } else {
        connection.query(`SELECT uid, nick_name FROM user WHERE uid = ${data.from_user_id}`, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            //console.log(row[0]);
            resolve(row[0]);
          } else {
            //console.log(err);
            next(err);
          }
        });
      }
    });
  };

  // 받는 사람 id&닉네임 가져오기
  async function getNameTo(data) {
    return new Promise((resolve, reject) => {
      if (data === null) {
        resolve(null);
      } else {
        connection.query(`SELECT uid, nick_name FROM user WHERE uid = ${data.to_user_id}`, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            //console.log(row[0]);
            resolve(row[0]);
          } else {
            //console.log(err);
            next(err);
          }
        });
      }
    });
  };

  const respond = data => {
    res.status(200).json(data);
  };

  const error = err => {
    res.status(500).json({ error: err });
  };

  getList(userId)
    .then(respond)
    .catch(next);
};

exports.sendMsg = (req, res, next) => {
  const myUserId = req.decoded.uid;
  const toUserId = req.params.id;
  req.body["from_user_id"] = myUserId;
  req.body["to_user_id"] = toUserId;

  // 기존에 대화방이 있었는지 확인
  function ifGroupExist(myUserId, toUserId) {
    const p = new Promise((resolve, reject) => {
      if (!myUserId || !toUserId) {
        resolve(null);
      } else {
        connection.query(`SELECT uid FROM message_group WHERE to_user_id = ${myUserId} AND from_user_id = ${toUserId} OR to_user_id = ${toUserId} AND from_user_id = ${myUserId}`, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            resolve(row[0].uid);
          } else {
            //console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 채팅방이 없으면 대화방 생성, 채팅방 id를 리턴해줌
  function groupNotExist(myUserId, toUserId) {
    const p = new Promise((resolve, reject) => {
      if (!myUserId || !toUserId) {
        resolve(null);
      } else {
        connection.query("INSERT INTO message_group SET ?", { from_user_id: myUserId, to_user_id: toUserId }, (err, row) => {
          if (!err) {
            resolve(row.insertId);
          } else {
            //console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 채팅방이 있으면 날짜와 유저 업데이트, 채팅방 id를 리턴해줌
  function groupExist(id) {
    const p = new Promise((resolve, reject) => {
      if (!myUserId || !toUserId) {
        resolve(null);
      } else {
        connection.query(`UPDATE message_group SET ? WHERE uid = ${id}`, { from_user_id: myUserId, to_user_id: toUserId, update_time: new Date() }, (err, row) => {
          if (!err) {
            resolve(id);
          } else {
            //console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 메시지 테이블에 새 대화내용 저장
  function sendMsg(id) {
    const p = new Promise((resolve, reject) => {
      if (id === null) {
        resolve(null);
      } else {
        req.body["group_id"] = id;
        connection.query("INSERT INTO message SET ?", req.body, (err, row) => {
          if (!err) {
            resolve(id);
          } else {
            //console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  };

  const getSocketId = (data, uid) => {
    return new Promise((resolve, reject) => {
      //console.log("uid", uid);
      connection.query(`SELECT socket_id FROM user WHERE uid = ${uid}`, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          resolve({ data, socketId: row[0].socket_id });
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    const { sendAlarm } = require("../../socket");
    //console.log(sendAlarm);
    //console.log("socketId", data.socketId);
    try {
      sendAlarm(data.socketId, toUserId, data.data, "ReceiveMsg", myUserId);
      res.status(200).json({ success: true, groupId: data.data });
    } catch (err) {
      next(err);
    }
  };

  const error = err => {
    //console.log("err", err);
    res.status(500).json({ success: false, groupId: null, error: err });
  };

  ifGroupExist(myUserId, toUserId)
    .then(id => {
      if (id === null) {
        return groupNotExist(myUserId, toUserId);
      } else {
        return groupExist(id);
      }
    })
    .then(sendMsg)
    .then(data => getSocketId(data, toUserId))
    .then(respond)
    .catch(error);
};

exports.getMyMsgDetail = (req, res, next) => {
  const userId = req.decoded.uid;
  const groupId = req.params.id;
  const page = req.params.page;

  const removeOldMessage = () => {
    return new Promise((resolve, reject) => {
      const sql = `
      SET sql_safe_updates = 0;
      DELETE FROM opendesign.message M
        WHERE 
          (M.from_user_id=${userId} OR M.to_user_id=${userId}) 
            AND 
          (M.create_time <= NOW() - INTERVAL 3 MONTH)
      `;
      // SET sql_safe_updates = 1
      connection.query(sql, (err, _) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
  const getDetail = () => {
    return new Promise((resolve, reject) => {
      if (!groupId) {
        resolve(null);
      }
      connection.query(
        `SELECT
          M.uid, M.group_id, M.from_user_id, M.to_user_id, M.message, M.create_time, U.nick_name, T.s_img
        FROM opendesign.message M
        LEFT JOIN user U ON U.uid = M.from_user_id
        LEFT JOIN thumbnail T ON T.uid = U.thumbnail
        WHERE 
          (M.group_id = ${groupId})
            AND
          (M.create_time >= NOW()- INTERVAL 3 MONTH)
        ORDER BY M.create_time DESC LIMIT ${page * 10}, 10`,
        (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            resolve(row);
            // console.log(row);
          } else {
            console.error(err);
            reject(err);
          }
        });
    });
  };

  const getSocketId = (data, uid) => {
    return new Promise((resolve, reject) => {
      //console.log("uid", uid);
      connection.query(`SELECT socket_id FROM user WHERE uid = ${uid}`, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          resolve({ data, socketId: row[0].socket_id });
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const AlarmConfirm = (uid, groupId) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE alarm SET ? WHERE user_id = ${uid} AND content_id = ${groupId}`, { confirm: 1 }, (err, row) => {
        if (!err) {
          resolve(true);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  }

  const respond = async data => {
    const { getAlarm } = require("../../socket");
    await AlarmConfirm(userId, groupId);
    getSocketId(data, userId).then(data => {
      getAlarm(data.socketId, userId);
      res.status(200).json(data.data);
    }
    ).catch(next);
  };

  const error = err => {
    res.status(500).json({ error: err });
  };

  getDetail()
    // removeOldMessage()
    // .then(_ => getDetail())
    .then(respond)
    .catch(error);
};
