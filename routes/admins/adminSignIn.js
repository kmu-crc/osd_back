const connection = require("../../configs/connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const adminSignIn = (req, res, next) => {
    const { admin_id, password } = req.body;
    let userInfo = null;
    const verificationAdminID = (admin_id) => {
        const p = new Promise((resolve, reject) => {
            connection.query(`SELECT * FROM opendesign.admin WHERE admin_id='${admin_id}'`, (err, rows) => {
                if (!err) {
                    if (rows.length === 0) {
                        const errorMessage = `${admin_id}은 opendesign 관리자가 아닙니다.`;
                        reject(errorMessage);
                    } else if (rows[0].admin_id === admin_id) {
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
            connection.query(`SELECT * FROM opendesign.admin WHERE admin_id='${admin_id}';`, (err, rows) => {
                if (!err) {
                    bcrypt.compare(pw, rows[0].admin_pw, function (err, respond) {
                        if (!err) {
                            if (respond) {
                                resolve(rows[0].uid);
                            } else {
                                res.status(200).json({ success: false, isMember: true, isPassword: false });
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
                    uid: userInfo.uid,
                    admin_id: userInfo["admin_id"]
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
        });
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
        if (status == null) status = 500;
        res.status(status).json({
            success: false,
            error: err
        });
    };

    verificationAdminID(admin_id)
        .then(() => { return verificationPw(password) })
        .then(createJWT)
        .then(respond)
        .catch(error);
};

module.exports = adminSignIn;
