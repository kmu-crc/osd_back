var connection = require("../../configs/connection");

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
          console.log(err);
          reject(err);
        }
      });
    });
  };

  // group_counter 테이블 업데이트
  const updateGroupCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE group_counter SET like = like + 1 WHERE group_id = ${groupId}`, (err, row) => {
        if (!err) {
          res.status(200).json({success: true, group_id: groupId});
        } else {
          console.log(err);
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
          console.log(err);
          reject(err);
        }
      });
    });
  };

  // group_counter 테이블 업데이트
  const updateGroupCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE group_counter SET like = like - 1 WHERE group_id = ${groupId}`, (err, row) => {
        if (!err) {
          res.status(200).json({success: true, group_id: groupId});
        } else {
          console.log(err);
          res.status(500).json({success: false, group_id: groupId});
        }
      });
    });
  };

  deleteGroupLike()
    .then(updateGroupCount);
};
