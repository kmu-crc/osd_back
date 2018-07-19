const { isUserDetail } = require("../../middlewares/verifications");
const connection = require("../../configs/connection");

const check = (req, res, next) => {
  const getThumbnail = decoded => {
    return new Promise(
      (resolve, reject) => {
        connection.query(`SELECT * FROM thumbnail WHERE user_id=${decoded.uid} AND uid=(SELECT thumbnail FROM user WHERE uid=${decoded.uid})`, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            decoded.thumbnail = rows[0];
            resolve(decoded);
          }
        });
      }
    );
  };

  const getNickName = decoded => {
    return new Promise(
      (resolve, reject) => {
        connection.query(`SELECT nick_name FROM user WHERE uid=${decoded.uid}`, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            decoded.nickName = rows[0].nick_name;
            resolve(decoded);
          }
        });
      }
    );
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      info: req.decoded
    });
  };

  isUserDetail(req.decoded.uid)
    .then((isDetail) => {
      req.decoded.isDetail = isDetail;
      return getThumbnail(req.decoded);
    }).then(getNickName)
    .then(respond)
    .catch(next);
};

module.exports = check;
