const connection = require("../../configs/connection");
const { isGroup } = require("../../middlewares/verifications");

const getSocketId = (uid) => {
  return new Promise((resolve, reject) => {
    //console.log("uid", uid);
    connection.query(`SELECT socket_id FROM user WHERE uid = ${uid}`, (err, row) => {
      if (!err && row.length === 0) {
        resolve(null);
      } else if (!err && row.length > 0) {
        resolve({socketId: row[0].socket_id});
      } else {
        //console.log(err);
        reject(err);
      }
    });
  });
};
const getGroupUserId = (id) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM opendesign.group WHERE uid=${id}`, (err, rows) => {
      if (!err) {
        resolve(rows[0].user_id);
      } else {
        const errorMessage = "그룹가입신청이 실패하였습니다.";
        reject(errorMessage);
      }
    });
  });
};
exports.groupSignUp = (req, res, next) => {
  const parent_group_id = req.params.id;
  const user_id = req.decoded.uid;
  //console.log(req.body);

  const groupSignUpDB = (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO opendesign.group_join_design SET ?", data, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          const errorMessage = "그룹가입신청이 실패하였습니다.";
          reject(errorMessage);
        }
      });
    });
  };

  const JoinLoop = (data) => {
    //console.log(data);
    return new Promise((resolve, reject) => {
      let arr = data.join_design.map(item => {
        groupSignUpDB({parent_group_id, design_id: item})
          .then(resolve(true))
          .catch(err => reject(err));
      });
      Promise.all(arr).then(true).catch(err => reject(err));
    });
  };

  const respond = async (data) => {
    const { sendAlarm } = require("../../socket");
    //console.log(sendAlarm);
    let socket = getSocketId(req.decoded.uid);
    let toUserId = await getGroupUserId(parent_group_id).catch(next);
    sendAlarm(socket.socketId, toUserId, parent_group_id, "JoinGroup", req.decoded.uid);
    res.status(200).json({
      message: "그룹가입신청 성공",
      success: true
    });
  };

  isGroup(parent_group_id)
    .then(() => JoinLoop(req.body))
    .then(respond)
    .catch(next);
};

exports.groupSignUpGroup = (req, res, next) => {
  const parent_group_id = req.params.id;
  const user_id = req.decoded.uid;
  //console.log(req.body);

  const groupSignUpDB = (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO opendesign.group_join_group SET ?", data, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          const errorMessage = "그룹가입신청이 실패하였습니다.";
          reject(errorMessage);
        }
      });
    });
  };

  const JoinLoop = (data) => {
    //console.log(data);
    return new Promise((resolve, reject) => {
      let arr = data.join_group.map(item => {
        groupSignUpDB({parent_group_id, group_id: item})
          .then(resolve(true))
          .catch(err => reject(err));
      });
      Promise.all(arr).then(true).catch(err => reject(err));
    });
  };

  const respond = async (data) => {
    const { sendAlarm } = require("../../socket");
    //console.log(sendAlarm);
    let socket = getSocketId(req.decoded.uid);
    let toUserId = await getGroupUserId(parent_group_id).catch(next);
    sendAlarm(socket.socketId, toUserId, parent_group_id, "JoinGroup", req.decoded.uid);
    res.status(200).json({
      message: "그룹가입신청 성공",
      success: true
    });
  };

  isGroup(parent_group_id)
    .then(() => JoinLoop(req.body))
    .then(respond)
    .catch(next);
};
