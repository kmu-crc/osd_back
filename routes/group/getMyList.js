var connection = require("../../configs/connection");

exports.myDesignList = (req, res, next) => {
  const groupId = req.params.id;
  //console.log(groupId, req.decoded.uid)

  const getList = (obj) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT d.uid, d.user_id, d.title FROM design d WHERE user_id = ${obj.user_id} AND NOT EXISTS ( SELECT g.design_id, g.parent_group_id FROM group_join_design g WHERE g.design_id = d.uid AND g.parent_group_id = ${obj.groupId})`, (err, rows) => {
        if (!err) {
          //console.log("detail: ", rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    //console.log("data", data);
    res.status(200).json({
      message: "요청이 정상적으로 처리되었습니다.",
      success: true,
      list: data
    });
  };

  getList({user_id: req.decoded.uid, groupId})
    .then(respond)
    .catch(next);
};

exports.myGroupList = (req, res, next) => {
  const groupId = req.params.id;
  //console.log(groupId, req.decoded.uid);
  // AND NOT EXISTS ( SELECT p.group_id FROM group_join_group p WHERE p.group_id = g.uid )
  const getList = (obj) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT g.uid, g.user_id, g.title
      FROM opendesign.group g WHERE g.user_id = ${obj.user_id}
      AND NOT g.uid = ${groupId}
      AND NOT EXISTS ( SELECT m.parent_group_id FROM group_join_group m WHERE m.group_id = ${groupId} AND m.parent_group_id = g.uid )
      `, (err, rows) => {
        if (!err) {
          //console.log("detail: ", rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    //console.log("data", data);
    res.status(200).json({
      message: "요청이 정상적으로 처리되었습니다.",
      success: true,
      list: data
    });
  };

  getList({user_id: req.decoded.uid, groupId})
    .then(respond)
    .catch(next);
};

// 그룹 탈퇴 기능을 위해 지금 가입되어 있는 내 디자인 && 그룹 조회하기
exports.myExistDesignList = (req, res, next) => {
  const groupId = req.params.id;

  const getList = (obj) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT d.uid, d.user_id, d.title
      FROM design d WHERE user_id = ${obj.user_id}
      AND EXISTS ( SELECT g.design_id, g.parent_group_id FROM group_join_design g WHERE g.design_id = d.uid AND g.parent_group_id = ${obj.groupId})`,
      (err, rows) => {
        if (!err) {
          //console.log("detail: ", rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    //console.log("data", data);
    res.status(200).json({
      message: "요청이 정상적으로 처리되었습니다.",
      success: true,
      list: data
    });
  };

  getList({user_id: req.decoded.uid, groupId})
    .then(respond)
    .catch(next);
};

exports.myExistGroupList = (req, res, next) => {
  const groupId = req.params.id;

  const getList = (obj) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT g.uid, g.user_id, g.title
      FROM opendesign.group g WHERE g.user_id = ${obj.user_id}
      AND EXISTS ( SELECT p.group_id FROM group_join_group p WHERE p.parent_group_id = ${obj.groupId})`,
      (err, rows) => {
        if (!err) {
          //console.log("detail: ", rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    //console.log("data", data);
    res.status(200).json({
      message: "요청이 정상적으로 처리되었습니다.",
      success: true,
      list: data
    });
  };

  getList({user_id: req.decoded.uid, groupId})
    .then(respond)
    .catch(next);
};
