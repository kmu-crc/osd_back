const connection = require("../../configs/connection");
const { isUserDetail } = require("../../middlewares/verifications");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const signIn = (req, res, next) => {
  const {email, password} = req.body;
  console.log(req.body,"!!!!")
  let userInfo = null;
  const verificationEmail = (email) => {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM user WHERE email='${email}'`, (err, rows) => {
        if (!err) {
          if (rows.length === 0) {
            const errorMessage = `${email}은 opendesign 회원이 아닙니다.`;
            reject(errorMessage);
            // res.status(200).json({success: false, isMember: false, isPassword: false});
          } else if (rows[0].email === email) {
            userInfo = rows[0];
            resolve(rows);
          }
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  const verificationPw = (pw) => {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM user WHERE email='${email}';`, (err, rows) => {
        if (!err) {
          bcrypt.compare(pw, rows[0].password, function (err, respond) {
            if (!err) {
              if (respond) {
                resolve(rows[0].uid);
              } else {
                res.status(200).json({success: false, isMember: true, isPassword: false});
              }
            } else {
              reject(err);
            }
          });
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  const createJWT = (detail) => {
    //console.log(detail);
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
      token: data,
      isMember: true,
      isPassword: true
    });
  };
  const error = (err, status) => {
    if (status == null) status = 200;
    res.status(status).json({
      success: false,
      error: err
    });
  };

  verificationEmail(email)
  .then(() => verificationPw(password))
  .then((uid)=>isUserDetail(uid))
  .then(createJWT)
  .then(respond)
  .catch(error);
};

module.exports = signIn;
