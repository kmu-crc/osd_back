const connection = require("../../configs/connection");
const bcrypt = require("bcrypt");
const { isOnlyNicName, isOnlyEmail } = require("../../middlewares/verifications");

const signUp = (req, res, next) => {
  //console.log("===================signup==============", req.body);
  let { email, password, nickName } = req.body;
  let userData = {
    ...req.body,
    "is_admin": 0,
    "is_facebook": 0
  };
  function createHashPw () {
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

  function respond (data) {
    next();
  }

  function error (err) {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  isOnlyEmail(email)
  .then(() => {
    return isOnlyNicName(nickName);
  })
  .then(createHashPw)
  .then(createUser)
  .then(respond)
  .catch(error);
};

module.exports = signUp;
