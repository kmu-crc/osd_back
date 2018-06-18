var connection = require("../../configs/connection");

exports.deleteAllGroup = (req, res, next) => {
  const id = req.params.id;

  // 그룹 테이블에서 삭제
  const deleteGroup = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM opendesign.group WHERE group_id = ${id}`, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  // 그룹 카운트 테이블에서 삭제

  // 그룹 join 그룹 테이블에서 삭제

  // 썸네일 테이블에서 삭제

  // 그룹 이슈 삭제

  // 그룹 좋아요 테이블에서 삭제

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

  deleteGroup(id)
    .then(success)
    .catch(fail);
};
