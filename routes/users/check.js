const { isUserDetail } = require("../../middlewares/verifications");
const connection = require("../../configs/connection");

const check = (req, res, next) => {
  const getThumbnail = decoded => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM thumbnail WHERE uid=(SELECT thumbnail FROM user WHERE uid=${decoded.uid})`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            decoded.thumbnail = rows[0]==undefined?null:rows[0];
            resolve(decoded);
          }
        }
      );
    });
  };

  const getUserCategory = decoded => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT category_level1 FROM user_detail WHERE user_id=${decoded.uid}`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            if (rows.length > 0) {
              decoded.category1 = rows[0].category_level1;
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
  
  const getNickName = decoded => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT nick_name FROM user WHERE uid=${decoded.uid}`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            if (rows.length > 0) {
              decoded.nickName = rows[0].nick_name || null;
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

  const getIsDesigner = decoded => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT is_designer FROM opendesign.user_detail WHERE user_id=${decoded.uid}`, (err,rows)=>{
        if(err){
          reject(err)
        } else {
          if (rows.length > 0) {
            decoded.is_designer = rows[0].is_designer
            // console.log(decoded.is_designer, "IS DESIGNER?")
            resolve(decoded)
          } else {
            decoded.is_designer = 0
            resolve(decoded)
          }
        }
      })
    })
  }

  const respond = data => {
    res.status(200).json({
      success: true,
			//exp: req.decoded.exp 
      info: req.decoded
    });
  };

  isUserDetail(req.decoded.uid)
    .then(isDetail => {
      req.decoded.isDetail = isDetail;
      return getThumbnail(req.decoded);
    })
    .then(getNickName)
    .then(getUserCategory)
    .then(getIsDesigner)
    .then(respond)
    .catch(next);
};

module.exports = check;
