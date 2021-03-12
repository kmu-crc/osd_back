var connection = require("../../configs/connection");

const getSocketId = uid => {
  return new Promise((resolve, reject) => {
    // console.log("uid", uid);
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

const getGroupUserId = id => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM opendesign.group WHERE uid=${id}`,
      (err, rows) => {
        if (!err) {
          resolve(rows[0].user_id);
        } else {
          const errorMessage = "좋아요를 실패하였습니다.";
          reject(errorMessage);
        }
      }
    );
  });
};

const SendSuccessAlarm = async (fromId, contentId) => {
  const { sendAlarm } = require("../../socket")
  const receiver = await getGroupUserId(contentId)
  await getSocketId(receiver).then( socket =>
    sendAlarm(socket.socketId, receiver, contentId, "LikeGroup", fromId))
};

exports.getLikeGroup = (req, res, next) => {
  const userId = req.decoded.uid;
  const groupId = req.params.id;

  // group 좋아요 여부 가져오기
  const getLike = () => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM group_like WHERE user_id = ${userId} AND group_id = ${groupId}`, (err, result) => {
        if (!err && result.length === 0) {
          //console.log(result);
          res.status(200).json({like: false});
        } else if (!err && result.length > 0) {
          res.status(200).json({like: true});
        } else {
          //console.log(err);
          res.status(500).json({like: false});
        }
      });
    });
  };

  getLike();
};

exports.likeGroup = (req, res, next) => {
  const userId = req.decoded.uid;
  const groupId = req.params.id;

  // group_like 테이블 업데이트
  const updateGroupLike = () => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO group_like SET ? ", {user_id: userId, group_id: groupId}, (err, row) => {
        if (!err) {
          resolve(groupId);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  // group_counter 테이블 업데이트
  const updateGroupCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE group_counter SET group_counter.like = group_counter.like + 1 WHERE group_id = ${groupId}`, (err, row) => {
        if (!err) {
          SendSuccessAlarm(userId, groupId)
          res.status(200).json({success: true, group_id: groupId});
        } else {
          //console.log(err);
          res.status(500).json({success: false, group_id: groupId});
        }
      });
    });
  };

  updateGroupLike()
    .then(updateGroupCount);
};

exports.unlikeGroup = (req, res, next) => {
  const userId = req.decoded.uid;
  const groupId = req.params.id;

  // group_like 테이블 업데이트
  const deleteGroupLike = () => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM group_like WHERE user_id = ${userId} AND group_id = ${groupId}`, (err, row) => {
        if (!err) {
          resolve(groupId);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  // group_counter 테이블 업데이트
  const updateGroupCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE group_counter SET group_counter.like = group_counter.like - 1 WHERE group_id = ${groupId}`, (err, row) => {
        if (!err) {
          res.status(200).json({success: true, group_id: groupId});
        } else {
          //console.log(err);
          res.status(500).json({success: false, group_id: groupId});
        }
      });
    });
  };

  deleteGroupLike()
    .then(updateGroupCount);
};
