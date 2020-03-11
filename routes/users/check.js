const { isUserDetail } = require("../../middlewares/verifications");
const connection = require("../../configs/connection");

const check = (req, res, next) => {
  const user_id = req.decoded.uid;

  const getThumbnail = id => {
    return new Promise((resolve, reject) => {
      const sql = 
      `SELECT K.s_img FROM 
        (SELECT * FROM market.thumbnail T WHERE T. user_id=${id} AND T.uid IN (SELECT thumbnail FROM market.user U WHERE U.uid=${id}) 
          UNION SELECT * FROM market.thumbnail T WHERE T.user_id=${id} AND T.uid IN (SELECT thumbnail_id FROM market.expert E WHERE E.user_id=${id})) K
      ORDER BY K.uid DESC
      LIMIT 1`;
      connection.query(sql, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      });
    });
  };

  const getNickName = decoded => {
    console.log("getNickName", decoded);
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT nick_name FROM market.user WHERE uid=${decoded}`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            if (rows.length > 0) {
              req.decoded.nickName = rows[0].nick_name;
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

  function isDesigner(data) {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT (IF(COUNT(*)>0,1,0)) as isDesigner FROM market.expert WHERE user_id=${user_id} AND type="designer"`, (err, row) => {
        if (!err && row.length === 0) {
          data.isDesigner = false;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.isDesigner = row[0].isDesigner;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }
  function isMaker(data) {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT (IF(COUNT(*)>0,1,0)) as isMaker FROM market.expert WHERE user_id=${user_id} AND type="maker"`, (err, row) => {
        if (!err && row.length === 0) {
          data.isMaker = false;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.isMaker = row[0].isMaker;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  const respond = data => {
    res.status(200).json({
      success: true,
      info: req.decoded
    });
  };

  isUserDetail(req.decoded.uid)
    .then(getNickName(req.decoded.uid))
    .then(nickname => {
      req.decoded.nickName = nickname;
      return getThumbnail(req.decoded.uid)
    })
    .then(thumbnail => {
      req.decoded.thumbnail = thumbnail;
      return req.decoded;
    })
    .then(isDesigner)
    .then(isMaker)
    .then(respond)
    .catch(next);
};

module.exports = check;
