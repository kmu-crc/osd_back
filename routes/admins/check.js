const connection = require("../../configs/connection");

const check = (req, res, next) => {
  const getAdminUid = decoded => {
    return new Promise((resolve, reject) => {
      // console.log(decoded,`SELECT admin_id FROM opendesign.admin WHERE uid=\'${decoded.uid}\'`);
      connection.query(
        `SELECT uid FROM opendesign.admin WHERE admin_id='${decoded.admin_id}'`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            if (rows.length > 0) {
              decoded.uid = rows[0].uid;
              resolve(decoded);
            } else {
              let err = Error("잘못된 회원 정보");
              reject(err);
            }
          }
        }
      );
    });
  };

  const respond = data => {
    res.status(200).json({
      success: true,
      info: req.decoded
    });
  };

  getAdminUid(req.decoded)
    .then(respond)
    .catch(next);
};

module.exports = check;
