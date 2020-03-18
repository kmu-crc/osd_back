const connection = require("../../configs/connection");
const bcrypt = require("bcrypt");
const { isOnlyNicName, isOnlyEmail } = require("../../middlewares/verifications");

const signUp = (req, res, next) => {
  // console.log("===================signup==============", req.body);
  let { email, password, nick_name } = req.body;
  let userData = {
    ...req.body,
  };
  function createHashPw() {
    const p = new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, function (err, hash) {
        if (!err) {
          userData.password = hash;
          resolve(userData);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  function createUser(data) {
    const p = new Promise((resolve, reject) => {
      connection.query("INSERT INTO market.user SET ?", data, (err, rows, fields) => {
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
  // function createPointEntry(data) {
  //   return new Promise((resolve, reject) => {
  //     const sql = `INSERT INTO market.point SET ?`;
  //     connection.query(sql, { point: 0, user_id: data }, (err, row) => {
  //       if (!err) {
  //         resolve(data);
  //       } else {
  //         reject(err);
  //       }
  //     });
  //   })
  // }

  function respond(data) {
    next();
  }

  function error(err) {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  isOnlyEmail(email)
    .then(() => {
      return isOnlyNicName(nick_name);
    })
    .then(createHashPw)
    .then(createUser)
    // .then(createPointEntry)
    .then(respond)
    .catch(error);
};

module.exports = signUp;
