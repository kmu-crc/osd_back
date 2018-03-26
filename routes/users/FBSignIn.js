var connection = require("../../configs/connection");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const FBSignIn = (req, res, next) => {
  const { FBUserId } = req.body;
  let userInfo = null;
  const verificationFBUserId = (userId) => {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM user WHERE FB_user_id='${userId}'`, (err, rows) => {
        if (!err) {
          if (rows[0]["FB_user_id"] === userId) {
            userInfo = rows[0];
            resolve(rows);
          } else {
            const errorMessage = "opendesign 회원이 아닙니다.";
            reject(errorMessage);
          }
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  const createJWT = () => {
    const p = new Promise((resolve, reject) => {
      jwt.sign(
        {
          uid: userInfo.uid,
          email: userInfo.email,
          nickName: userInfo["nick_name"],
          admin: userInfo["is_admin"]
        },
        process.env.SECRET_CODE,
        {
          expiresIn: "7d",
          issuer: "opendesign.com",
          subject: "userInfo"
        }, (err, token) => {
          if (err) {
            reject(err);
          } else {
            resolve(token);
          }
        });
    })
    return p;
  };

  const respond = (data) => {
    res.status(200).json({
      token: data
    });
  };
  const error = (err) => {
    res.status(500).json({
      error: err
    });
  };

  verificationFBUserId(FBUserId)
  .then(createJWT)
  .then(respond)
  .catch(error);
};

module.exports = FBSignIn;
