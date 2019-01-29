const connection = require("../../configs/connection");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();

exports.findPw = (req, res, next) => {
  const email = req.body.email;
  console.log("email", email);
  let pw = "";
  let hashPw = "";
  let old = "";

  const isOnlyEmail = email => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT count(email) FROM user WHERE email = "${email}"`,
        (err, rows) => {
          console.log("err", err);
          if (!err) {
            console.log("??", rows);
            if (rows[0]["count(email)"] === 0) {
              const errorMessage = new Error("가입된 email이 아닙니다.");
              reject(errorMessage);
            } else {
              resolve(true);
            }
          } else {
            const errorMessage = "isOnlyEmail err : " + err;
            reject(errorMessage);
          }
        }
      );
      //backup original password
      connection.query(
        `SELECT password FROM user WHERE email="${email}"`,
        (err, rows) => {
          if (!err) {
            old = rows[0]["password"];
          }
        }
      );
    });
  };

  const randomPw = () => {
    return new Promise(async (resolve, reject) => {
      try {
        let str =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        str = Array.from(str);
        for (let i = 0; i < 10; i++) {
          pw += await str[Math.floor(Math.random() * str.length - 1)];
        }
        resolve(pw);
      } catch (err) {
        reject(err);
      }
    });
  };

  const createHashPw = password => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, function(err, hash) {
        if (!err) {
          hashPw = hash;
          resolve(hashPw);
        } else {
          reject(err);
        }
      });
    });
  };

  const updatePW = (email, pw) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE user SET ? WHERE email = "${email}"`,
        { password: pw },
        (err, row) => {
          if (!err) {
            resolve(email);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  const sendMail = (mail, pw) => {
    return new Promise((resolve, reject) => {
      console.log("process.env.MAIL_ID", process.env.MAIL_ID);
      const smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.MAIL_ID,
          pass: process.env.MAIL_PASSWORD
        }
      });
      const mailOptions = {
        from: "opensrcdesign@gmail.com",
        to: `${mail}`,
        subject: "opendesign password 변경",
        text: `${pw}`
      };
      smtpTransport.verify((error, success) => {
        if (error) {
          updatePW(email, old);
        } else {
          console.log("server is ready");
        }
      });
      smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
          console.log("mailError", error);
          reject(error);
        } else {
          resolve("등록된 e-mail로 새로운 비밀번호가 전송되었습니다.");
        }
        smtpTransport.close();
      });
    });
  };
  isOnlyEmail(email)
    .then(randomPw)
    .then(() => createHashPw(pw))
    .then(() => updatePW(email, hashPw))
    .then(() => sendMail(email, pw))
    .then(data => {
      res.status(200).json({
        success: true,
        message: data
      });
    })
    .catch(next);
};
