var connection = require("../../configs/connection");

exports.getMyMsgList = (req, res, next) => {
  const userId = req.decoded.uid;

  // 내가 주고 받은 메시지 id 가져오기
  function getList (id) {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM message_group WHERE to_user_id = ${id} OR from_user_id = ${id}`, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row;
          console.log(row);
          resolve(data);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
    return p;
  };

  // 보낸 사람 닉네임 가져오기
  function getNameFrom (data) {
    const p = new Promise((resolve, reject) => {
      if (data === null) {
        resolve(null);
      } else {
        connection.query("SELECT nick_name FROM user WHERE uid = ?", data.from_user_id, (err, row) => {
          if (!err && row.length === 0) {
            data.from_user_name = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.from_user_name = row[0];
            resolve(data);
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
    res.status(200).json(data);
  };

  const error = err => {
    res.status(500).json({error: err});
  };

  getList(userId)
    .then(getNameFrom)
    .then(respond)
    .catch(error);
};
