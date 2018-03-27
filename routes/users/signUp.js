var connection = require("../../configs/connection");
const bcrypt = require("bcrypt");
const { isOnlyNicName, isOnlyEmail } = require("../../middlewares/verifications");

const signUp = (req, res, next) => {
  let { email, password, nickName } = req.body;

  function createHashPw () {
    const p = new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, function (err, hash) {
        if (!err) {
          let userData = {
            "email": email,
            "password": hash,
            "nick_name": nickName,
            "is_admin": 0,
            "is_facebook": 0
          };
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
