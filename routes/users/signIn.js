const connection = require("../../configs/connection");
const { isUserDetail } = require("../../middlewares/verifications");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const signIn = (req, res, next) => {
  const {email, password} = req.body;
  let userInfo = null;
  const verificationEmail = (email) => {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM user WHERE email='${email}'`, (err, rows) => {
        if (!err) {
          if (rows.length === 0) {
            const errorMessage = `${email}은 opendesign 회원이 아닙니다.`;
            reject(errorMessage);
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
          bcrypt.compare(pw, rows[0].password, function (err, res) {
            if (!err) {
              if (res) {
                resolve(rows[0].uid);
              } else {
                let message = "비밀번호가 일치하지 않습니다.";
                reject(message);
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
      token: data
    });
  };
  const error = (err) => {
    res.status(500).json({
      error: err
    });
  };

  verificationEmail(email)
  .then(() => {
    return verificationPw(password);
  })
  .then(isUserDetail)
  .then(createJWT)
  .then(respond)
  .catch(error);
};

module.exports = signIn;
