const connection = require("../../configs/connection");
const { isGroup } = require("../../middlewares/verifications");

exports.groupSignUp = (req, res, next) => {
  const parent_group_id = req.params.id;
  const user_id = req.decoded.uid;
  console.log(req.body);

  const groupSignUpDB = (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO opendesign.group_join_design SET ?", data, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          const errorMessage = "그룹가입신청이 실패하였습니다.";
          reject(errorMessage);
        }
      });
    });
  };

  const JoinLoop = (data) => {
    console.log(data);
    return new Promise((resolve, reject) => {
      let arr = data.join_design.map(item => {
        groupSignUpDB({parent_group_id, design_id: item})
          .then(resolve(true))
          .catch(err => reject(err));
      });
      Promise.all(arr).then(true).catch(err => reject(err));
    });
  };

  const respond = (data) => {
    res.status(200).json({
      message: "그룹가입신청 성공",
      success: true
    });
  };

  isGroup(parent_group_id)
    .then(() => JoinLoop(req.body))
    .then(respond)
    .catch(next);
};

exports.groupSignUpGroup = (req, res, next) => {
  const parent_group_id = req.params.id;
  const user_id = req.decoded.uid;
  console.log(req.body);

  const groupSignUpDB = (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO opendesign.group_join_group SET ?", data, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          const errorMessage = "그룹가입신청이 실패하였습니다.";
          reject(errorMessage);
        }
      });
    });
  };

  const JoinLoop = (data) => {
    console.log(data);
    return new Promise((resolve, reject) => {
      let arr = data.join_group.map(item => {
        groupSignUpDB({parent_group_id, group_id: item})
          .then(resolve(true))
          .catch(err => reject(err));
      });
      Promise.all(arr).then(true).catch(err => reject(err));
    });
  };

  const respond = (data) => {
    res.status(200).json({
      message: "그룹가입신청 성공",
      success: true
    });
  };

  isGroup(parent_group_id)
    .then(() => JoinLoop(req.body))
    .then(respond)
    .catch(next);
};
