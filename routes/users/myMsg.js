var connection = require("../../configs/connection");

exports.getMyMsgList = (req, res, next) => {
  const userId = req.decoded.uid;

  // 내가 주고 받은 메시지 id 가져오기
  async function getList (id) {
    // const p = new Promise((resolve, reject) => {
    //   connection.query(`SELECT * FROM message_group WHERE to_user_id = ${id} OR from_user_id = ${id}`, (err, row) => {
    //     if (!err && row.length === 0) {
    //       resolve(null);
    //     } else if (!err && row.length > 0) {
    //       let data = row;
    //       console.log("받은 메시지", row);
    //       resolve(data);
    //     } else {
    //       console.log(err);
    //       reject(err);
    //     }
    //   });
    // });
    // return p;
    
    let rows = new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM message_group WHERE to_user_id = ${id} OR from_user_id = ${id}`, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row;
          console.log("받은 메시지", row);
          resolve(data);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
    return rows.then(async data => {
      console.log("rows", data);
      for (let item of data) {
        console.log("for loop", item);
        item.from_user_name = await getNameFrom(item);
        item.to_user_name = await getNameTo(item);
      }
      console.log("rows", data);
      return data;
    });
  };

  // 보낸 사람 닉네임 가져오기
  async function getNameFrom (data) {
    return new Promise((resolve, reject) => {
      if (data === null) {
        resolve(null);
      } else {
        connection.query(`SELECT nick_name FROM user WHERE uid = ${data.from_user_id}`, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            resolve(row[0].nick_name);
          } else {
            next(err);
          }
        });
      }
    });
  };

  // 받는 사람 닉네임 가져오기
  async function getNameTo (data) {
    return new Promise((resolve, reject) => {
      if (data === null) {
        resolve(null);
      } else {
        connection.query(`SELECT nick_name FROM user WHERE uid = ${data.to_user_id}`, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            resolve(row[0].nick_name);
          } else {
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
    res.status(500).json({error: err});
  };

  getList(userId)
    .then(respond)
    .catch(next);
};

exports.sendMsg = (req, res, next) => {
  const myUserId = req.decoded.uid;
  const toUserId = req.params.id;
  req.body["to_user_id"] = toUserId;
  console.log(req.body);

  // 기존에 대화방이 있었는지 확인
  function ifGroupExist (myUserId, toUserId) {
    const p = new Promise((resolve, reject) => {
      if (!myUserId || !toUserId) {
        resolve(null);
      } else {
        connection.query(`SELECT uid FROM message_group WHERE to_user_id = ${myUserId} AND from_user_id = ${toUserId} OR to_user_id = ${toUserId} AND from_user_id = ${myUserId}`, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            console.log(row[0].uid);
            resolve(row[0].uid);
          } else {
            console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 채팅방이 없으면 대화방 생성, 채팅방 id를 리턴해줌
  function groupNotExist (myUserId, toUserId) {
    const p = new Promise((resolve, reject) => {
      if (!myUserId || !toUserId) {
        resolve(null);
      } else {
        connection.query("INSERT INTO message_group SET ?", { from_user_id: myUserId, to_user_id: toUserId }, (err, row) => {
          if (!err) {
            console.log(row);
            resolve(row.insertId);
          } else {
            console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 채팅방이 있으면 날짜 업데이트, 채팅방 id를 리턴해줌
  function groupExist (id) {
    const p = new Promise((resolve, reject) => {
      if (!myUserId || !toUserId) {
        resolve(null);
      } else {
        connection.query("UPDATE message_group SET update_time = now() WHERE uid = ?", id, (err, row) => {
          if (!err) {
            console.log("groupExist", row);
            console.log(id);
            resolve(id);
          } else {
            console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 메시지 테이블에 새 대화내용 저장
  function sendMsg (id) {
    const p = new Promise((resolve, reject) => {
      if (id === null) {
        resolve(null);
      } else {
        req.body["group_id"] = id;
        connection.query("INSERT INTO message SET ?", req.body, (err, row) => {
          if (!err) {
            resolve(row);
            console.log(row);
          } else {
            console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  };

  const respond = data => {
    res.status(200).json({success: true});
  };

  const error = err => {
    res.status(500).json({success: false, error: err});
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
    .then(respond)
    .catch(error);
};

exports.getMyMsgDetail = (req, res, next) => {
  const userId = req.decoded.uid;
  const groupId = req.params.id;

  function getDetail (groupId) {
    const p = new Promise((resolve, reject) => {
      if (!groupId) {
        resolve(null);
      } else {
        connection.query("SELECT * FROM message WHERE group_id = ?", groupId, (err, row) => {
          if (!err && row.length === 0) {
            console.log(row);
            resolve(null);
          } else if (!err && row.length > 0) {
            console.log(row);
            resolve(row);
          } else {
            console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  }

  const respond = data => {
    res.status(200).json(data);
  };

  const error = err => {
    res.status(500).json({error: err});
  };

  getDetail(groupId)
    .then(respond)
    .catch(error);
};
