const connection = require("../../configs/connection");
const { isMember } = require("../../middlewares/verifications");

const secession = (req, res) => {
  //console.log("code");
  const deleteUser = () => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE user SET ? WHERE uid="${req.decoded.uid}"`, {d_flag: 1}, (err, rows) => {
        if (!err) {
          //console.log("rows", rows);
          resolve();
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      message: "성공적으로 탈퇴되었습니다."
    });
  };

  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  isMember(req.decoded.uid)
  .then(deleteUser)
  .then(respond)
  .catch(error);
};

module.exports = secession;
