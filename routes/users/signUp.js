const connection = require("../../configs/connection");
const bcrypt = require("bcrypt");
const { isOnlyNicName, isOnlyEmail } = require("../../middlewares/verifications");

const signUp = (req, res, next) => {
  // console.log("===================signup==============\n", req.body);
  let { email, password, nick_name } = req.body;
let userData = {
    ...req.body,
    "is_admin": 0,
    "is_facebook": 0
  };
  function createHashPw () {
// console.log("createHashPw");
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
// console.log("createUser");
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
  function createUserDetail (data) {
// console.log("createUserDetail");
    const p = new Promise((resolve, reject) => {
      connection.query(`INSERT INTO user_detail (user_id) VALUES ('${data}')`, (err, rows, fields) => {
        if (!err) { 
          let userId = data;
          resolve(userId);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };
	function thumbnail (data) {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE opendesign.user SET thumbnail = 10500 WHERE uid=${data}`;
				connection.query(sql, (err, row) => {
					if(!err) {
						resolve(data);
					} else {
						console.error(err);
						reject(err);
					}
				});
		});
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
    return isOnlyNicName(nick_name);
  })
  .then(createHashPw)
  .then(createUser)
  .then(createUserDetail)
	.then(thumbnail)
  .then(respond)
  .catch(error);
};

module.exports = signUp;
