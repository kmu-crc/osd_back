var connection = require("../../configs/connection");
const { isOnlyNicName, isOnlyEmail } = require("../../middlewares/verifications");

const FBSignUp = (req, res) => {
  let {email, nickName, thumbnail, FBUserId} = req.body;

  let userData = {
    "email": email,
    "nick_name": nickName,
    "is_admin": 0,
    "is_facebook": true,
    "FB_user_id": FBUserId,
    "thumbnail": null
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

  // facebook에서 thumbnail을 받으면 보통 50x50 사이즈이기 때문에 기본적으로 사용되는 thumbnail객체를 다 채우지 못한다.
  // 그렇기 때문에 s_img에 만 전달받은 thumbnail 경로를 넣어주고 나무지 img들은 null로 채워준다.
  function setThumbnail (userId) {
    let data = {
      "user_id": userId,
      "s_img": thumbnail,
      "m_img": null,
      "l_img": null
    };
    const p = new Promise((resolve, reject) => {
      connection.query("INSERT INTO thumbnail SET ?", data, (err, rows, fields) => {
        if (!err) {
          resolve({
            userId: userId,
            thumbnailId: rows.insertId
          });
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  function upDateThumbnail (data) {
    const p = new Promise((resolve, reject) => {
      resolve(true);
      connection.query(`UPDATE user SET thumbnail=${data.thumbnailId} WHERE uid="${data.userId}"`, (err, rows) => {
        if (!err) {
          resolve(true);
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

  isOnlyEmail(email)
  .then(() => isOnlyNicName(nickName))
  .then(() => createUser(userData))
  .then(setThumbnail)
  .then(upDateThumbnail)
  .then(respond)
  .catch(error);
};

module.exports = FBSignUp;
