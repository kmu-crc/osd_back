var connection = require("../../configs/connection");
const { isOnlyNicName, isOnlyEmail, isOnlyFBId } = require("../../middlewares/verifications");

const FBSignUp = (req, res) => {
  let {email, nickName, FBUserId} = req.body;

  let userData = {
    "email": email,
    "nick_name": nickName,
    "is_admin": 0,
    "is_facebook": true,
    "FB_user_id": FBUserId
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

  function error (err) {
    res.status(500).json({
      error: err
    });
  };

  function respond (data) {
    res.status(200).json({
      message: "회원가입을 환영합니다."
    });
  };

  isOnlyFBId(FBUserId)
  .then(() => isOnlyEmail(email))
  .then(() => isOnlyNicName(nickName))
  .then(() => createUser(userData))
  .then(respond)
  .catch(error);
};

module.exports = FBSignUp;
