var connection = require("../../configs/connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

exports.basicSignIn = (req, res, next) => {
  const {email, password} = req.body;
  let userInfo = null;
  const verificationEmail = (email) => {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM user WHERE email='${email}'`, (err, rows) => {
        if (!err) {
          if (rows[0].email === email) {
            userInfo = rows[0];
            resolve(rows);
          } else {
            const errorMessage = `${email}은 사용중이지 않습니다.`;
            reject(errorMessage);
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
      connection.query(`SELECT password FROM user WHERE email='${email}';`, (err, rows) => {
        if (!err) {
          bcrypt.compare(pw, rows[0].password, function (err, res) {
            if (!err) {
              if (res) {
                resolve(true);
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

  const createJWT = () => {
    const p = new Promise((resolve, reject) => {
      jwt.sign(
        {
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

  verificationEmail(email)
  .then(() => {
    return verificationPw(password);
  })
  .then(createJWT)
  .then(respond)
  .catch(error);
};
