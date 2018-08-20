var connection = require("../../configs/connection");

exports.myDesignList = (req, res, next) => {
  const groupId = req.params.id;
  console.log(groupId, req.decoded.uid)

  const getList = (obj) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT d.uid, d.user_id, d.title FROM design d WHERE user_id = ${obj.user_id} AND NOT EXISTS ( SELECT g.design_id, g.parent_group_id FROM group_join_design g WHERE g.design_id = d.uid AND g.parent_group_id = ${obj.groupId})`, (err, rows) => {
        if (!err) {
          console.log("detail: ", rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    console.log("data", data);
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
  console.log(groupId, req.decoded.uid)

  const getList = (obj) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT g.uid, g.user_id, g.title FROM opendesign.group g WHERE g.user_id = ${obj.user_id} AND NOT g.uid = ${groupId} AND NOT EXISTS ( SELECT p.group_id, p.parent_group_id FROM group_join_group p WHERE p.group_id = g.uid AND p.parent_group_id = ${obj.groupId})`, (err, rows) => {
        if (!err) {
          console.log("detail: ", rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    console.log("data", data);
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
