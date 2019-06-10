const connection = require("../../configs/connection");
const { isOnlyNicName, isOnlyEmail, isOnlyFBId, isUserDetail } = require("../../middlewares/verifications");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.FBSignIn = (req, res, next) => {
  const { FB_user_id } = req.body;
  let userInfo = null;
  const verificationFBUserId = (userId) => {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM user WHERE FB_user_id='${userId}'`, (err, rows) => {
        if (!err) {
          if (rows.length === 0) {
            res.status(200).json({
              isMember: false
            });
          } else if (rows[0]["FB_user_id"] === userId) {
            userInfo = rows[0];
            resolve(rows[0].uid);
          } else {
            const errorMessage = "FacekBook SignIn Error";
            reject(errorMessage);
          }
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  const createJWT = (detail) => {
    const p = new Promise((resolve, reject) => {
      jwt.sign(
        {
          uid: userInfo.uid,
          email: userInfo.email,
          nickName: userInfo["nick_name"],
          isAdmin: userInfo["is_admin"],
          isDetail: detail
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
      success: true,
      isMember: true,
      token: data
    });
  };
  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  verificationFBUserId(FB_user_id)
  .then(isUserDetail)
  .then(createJWT)
  .then(respond)
  .catch(error);
};

exports.FBSignUp = (req, res, next) => {
  //console.log(req.body);
  let {email, nickName, FBUserId} = req.body;
  req.body.is_admin = 0;
  req.body.is_facebook = true;

  function createUser (data) {
    const p = new Promise((resolve, reject) => {
      connection.query("INSERT INTO user SET ?", data, (err, rows, fields) => {
        if (!err) {
          let userId = rows.insertId;
          resolve(userId);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  function error (err) {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  function respond (data) {
    next();
  };

  isOnlyFBId(FBUserId)
  .then(() => isOnlyEmail(req.body.email))
  .then(() => isOnlyNicName(req.body.nick_name))
  .then(() => createUser(req.body))
  .then(respond)
  .catch(error);
};
