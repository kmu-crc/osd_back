var connection = require("../../configs/connection");

exports.deleteAllGroup = (req, res, next) => {
  const id = req.params.id;

  // 썸네일 id 가져오기
  const getThumbnail = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT thumbnail FROM opendesign.group WHERE uid = ${id}`, (err, row) => {
        if (!err && row.length > 0) {
          const thumbId = row[0].thumbnail;
          resolve(thumbId);
        } else if (row.length === 0) {
          resolve(null);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  // 썸네일 테이블에서 삭제
  const deleteThumbnail = (thumbId) => {
    return new Promise((resolve, reject) => {
      if (!thumbId) {
        resolve(null);
      } else {
        connection.query(`DELETE FROM thumbnail WHERE uid = ${thumbId}`, (err, row) => {
          if (!err) {
            resolve(row);
          } else {
            //console.log(err);
            reject(err);
          }
        });
      }
    });
  };

  // 그룹 테이블에서 삭제
  const deleteGroup = (id) => {
    //console.log("deleteGroup");
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM opendesign.group WHERE uid = ${id}`, (err, row) => {
        if (!err) {
          resolve(id);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  // 유저 카운트 업데이트
  const updateUserCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE user_counter SET total_group = total_group - 1 WHERE user_id = ${req.decoded.uid}`, (err, row) => {
        if (!err) {
          resolve(id);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  getThumbnail(id)
    .then(deleteThumbnail)
    .then(() => deleteGroup(id))
    .then(() => updateUserCount())
    .then(success)
    .catch(fail);
};
