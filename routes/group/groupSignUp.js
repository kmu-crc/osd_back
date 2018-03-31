const connection = require("../../configs/connection");
const { isGroup } = require("../../middlewares/verifications");

const groupSignUp = (req, res) => {
  let insertData = Object.assign({}, req.body);
  insertData["is_join"] = false;
  const groupSignUpDB = (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO group_join_design SET ?", data, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          const errorMessage = "그룹가입신청이 실패하였습니다.";
          reject(errorMessage);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      message: "그룹가입신청 성공"
    });
  };

  const error = (err) => {
    res.status(500).json({
      error: err
    });
  };

  isGroup(req.body["group_id"])
  .then(() => groupSignUpDB(insertData))
  .then(respond)
  .catch(error);
};

module.exports = groupSignUp;
