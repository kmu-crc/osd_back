const connection = require("../../configs/connection");

exports.deleteDesign = (req, res, next) => {
  const id = req.params.id;

  // 썸네일 id 가져오기
  const getThumbnail = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT thumbnail FROM design WHERE uid = ${id}`, (err, row) => {
        if (!err && row.length > 0) {
          const thumbId = row[0].thumbnail;
          resolve(thumbId);
        } else if (row.length === 0) {
          resolve(null);
        } else {
          console.log(err);
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
            console.log(err);
            reject(err);
          }
        });
      }
    });
  };

  // 유저 count 테이블에서 디자인 개수 삭제
  const updateUserCount = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE user_counter C 
      INNER JOIN design D ON C.user_id = D.user_id
      SET C.total_design = C.total_design - 1 WHERE D.uid = ${id}`, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  // 디자인 테이블에서 삭제
  const deleteDesign = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM design WHERE uid = ?", id, (err, row) => {
        if (!err) {
          // console.log(row);
          resolve(row);
        } else {
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
    .then(() => updateUserCount(id))
    .then(() => deleteDesign(id))
    .then(success)
    .catch(fail);
};
