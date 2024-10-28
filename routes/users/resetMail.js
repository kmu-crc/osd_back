const connection = require("../../configs/connection");
const bcrypt = require("bcrypt");
const generator = require('generate-password')
//const smtpTransport = require('../../configs/naver");
require("dotenv").config();
const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
	service: "Naver",
	auth: {
		user: process.env.NAVER,
		pass: process.env.NAVER_PW 
	},
	tls: {
		rejectUnauthorized: false
	}
});



//const AWS = require("aws-sdk");
//AWS.config.update({region: 'us-west-2'});
//const nodemailer = require("nodemailer");



exports.findPw = (req, res, next) => {
  const email = req.body.email
  let pw = ""
  let hashPw = ""
  let old = ""

  const isOnlyEmail = email => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT count(email) FROM user WHERE email = "${email}"`,
        (err, rows) => {
          if (!err) {
            if (rows[0]["count(email)"] === 0) {
              const errorMessage = new String("가입된 email이 아닙니다.")
              reject(errorMessage)
            } else {
              resolve(true)
            }
          } else {
            const errorMessage = "isOnlyEmail err : " + err
				 	console.error(err);
            reject(errorMessage)
          }
        }
      )
      //backup original password
      connection.query(
        `SELECT password FROM user WHERE email="${email}"`,
        (err, rows) => {
          if (!err && rows.length > 0) {
            old = rows[0]["password"]
          }
					if(err){
				 	console.error(err);
				 }
        }
      )
    })
  }

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
				 console.error(err);
        reject(err)
      }
    })
  }

  const randomPass = () => {
    pw = generator.generate({ length: 10, numbers: true })
    return pw;
  }

  const createHashPw = password => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, function (err, hash) {
        if (!err) {
          hashPw = hash
          resolve(hashPw)
        } else {
				 console.error(err);
          reject(err)
        }
      })
    })
  }

  const updatePW = (email, pw) => {
    console.log("update pw::", pw)
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE user SET ? WHERE email = "${email}"`,
        { password: pw },
        (err, row) => {
          if (!err) {
						console.log("update completed: ", pw);
            resolve(email, pw)
          } else {
						console.error("update has failed: ", pw);
            reject(err)
          }
        }
      )
    })
  }


  const sendMail = (mail, pw) => {
		return new Promise( async (resolve, reject) => {
			const mailOption = {
				from: "ggmsng@naver.com",
				to: mail,
				subject: "[오픈소스디자인] 변경된 비밀번호",
				text: `요청에 따라 비밀번호가 임시로 발급되었습니다. 로그인 후 비밀번호를 변경해주세요. 비밀번호는 ${pw} 입니다.`
			}
			await smtpTransport.sendMail(mailOption, (err, res) => {
				if(err) {
					console.error(err);
					reject(err);
				} else {
					resolve(res);
				}
			});
			smtpTransport.close();
		});
		//new AWS.SES({apiVersion: '2010-12-01'})
		//	.sendEmail((mail, pw) => ({
		//		Destination: { CCAddresses:[], ToAddresses: [mail] },
		//		Message: { 
		//			Body: {
		//				Html: { 
		//					Charset:'UTF-8', 
		//					Data: '<html><head></head><body>reset password</body></html>'}, 
		//				Text: {
		//					Charset: 'UTF-8',
		//					Data: 'Reset email password'
		//				},
		//			},
		//			Subject: { 
		//				Charset:'UTF-8', 
		//				Data: 'Reset email password'
		//			}
		//		},
		//		Source: 'opensrcdesign@gmail.com'}))
		//	.promise()
		//	.then(data => { 
		//		console.log(data); 
		//		resolve(data);
		//	})
		//	.catch(err => {
		//		console.error(err, err.stack);
		//		reject(err);
		//	});
	}

  const notFoundEmail = (err) => {
		console.error(err);
    res.status(500).json({ success: false, message: err })
  }
  const success = (msg) => {
    res.status(200).json({ success: true, message: msg })
  }

  isOnlyEmail(email)
    //    .then(randomPw)
    .then(randomPass)
    .then(() => createHashPw(pw))
    .then(() => updatePW(email, hashPw))
    .then(() => sendMail(email, pw))
    .then(success)
    .catch(notFoundEmail)
}



/*
  // console.log("process.env.MAIL_ID", process.env.MAIL_ID, process.env.MAIL_PASSWORD);
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
        text: `새롭게 변경된 비밀번호는 아래와 같습니다. \n아이디: ${mail}\n비밀번호: ${pw}\n`
      }
      smtpTransport.verify((error, success) => {
        if (error) {
          console.error(error)
          updatePW(email, old)
        } else {
          //console.log("server is ready");
        }
      });
      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
          //console.log("mailError", error);
          reject(error);
        } else {
          resolve("등록된 e-mail로 새로운 비밀번호가 전송되었습니다.");
        }
        smtpTransport.close();
      })
*/
