const connection = require("../../configs/connection");
const { isGroup } = require("../../middlewares/verifications");

const getSocketId = (uid) => {
  return new Promise((resolve, reject) => {
    //console.log("uid", uid);
    connection.query(`SELECT socket_id FROM user WHERE uid = ${uid}`, (err, row) => {
      if (!err && row.length === 0) {
        resolve(null);
      } else if (!err && row.length > 0) {
        resolve({ socketId: row[0].socket_id });
      } else {
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
  // console.log(req.body);
  // console.log(req.params);

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
    return new Promise((resolve, reject) => {
      let arr = data.join_design.map(item => {
        groupSignUpDB({ parent_group_id, design_id: item })
          .then(alarmSetting(item))
          .catch(err => reject(err));
      });
      Promise.all(arr).then(true).catch(err => reject(err))
    });
  };

  const alarmSetting = async (design) => {
    const { sendAlarm } = require("../../socket");
    await getGroupUserId(parent_group_id)
      .then(recevier => getSocketId(recevier)
        .then(socket => sendAlarm(socket.socketId, recevier, parent_group_id, "JoinGroupWithDesign", req.decoded.uid, design)))
  }

  const respond = () => {
    res.status(200).json({
      message: "그룹가입신청 성공",
      success: true
    })
  }

  isGroup(parent_group_id)
    .then(JoinLoop(req.body))
    .then(respond)
    .catch(next);
};

exports.groupSignUpGroup = (req, res, next) => {
  const parent_group_id = req.params.id;

  const groupSignUpDB = (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO opendesign.group_join_group SET ?", data, (err, rows) => {
        if (!err) {
          resolve(rows)
        } else {
          const errorMessage = "그룹가입신청이 실패하였습니다."
          reject(errorMessage)
        }
      })
    })
  }

  const JoinLoop = (data) => {
    return new Promise((resolve, reject) => {
      let arr = data.join_group.map(item => {
        groupSignUpDB({ parent_group_id, group_id: item })
          .then(alarmSetting(item))
          .catch(err => reject(err))
      })
      Promise.all(arr).then(true).catch(err => reject(err))
    })
  }
  const alarmSetting = async (group) => {
    const { sendAlarm } = require("../../socket");
    await getGroupUserId(parent_group_id)
      .then(recevier => getSocketId(recevier)
        .then(socket => sendAlarm(socket.socketId, recevier, parent_group_id, "JoinGroupWithGroup", req.decoded.uid, group)))
  }
  const respond = () => {
    res.status(200).json({
      message: "그룹가입신청 성공",
      success: true
    });
  };

  isGroup(parent_group_id)
    .then(JoinLoop(req.body))
    .then(respond)
    .catch(next)
};
