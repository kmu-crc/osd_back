var connection = require("../../configs/connection");

// 디자인 가입 승인
exports.acceptDesign = (req, res, next) => {
  const group = req.params.id;
  const designId = req.params.designId;

  function acceptDesign (id, designId) {
    const p = new Promise((resolve, reject) => {
      connection.query(`UPDATE group_join_design SET is_join = 1 WHERE parent_group_id = ${id} AND design_id = ${designId}`, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
    return p;
  };

  function countUpdate (data) {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE group_counter SET design = design + 1 WHERE group_id = ${group}`, (err, row) => {
        if (!err) {
          res.status(200).json({success: true});
        } else {
          res.status(500).json({success: false});
        }
      });
    });
  };

  acceptDesign(group, designId)
    .then(countUpdate);
};

// 가입한 & 신청한 디자인 삭제
exports.deleteDesign = (req, res, next) => {
  const group = req.params.id;
  const designId = req.params.designId;

  function deleteDesign (id, designId) {
    const p = new Promise((resolve, reject) => {
      connection.query(`DELETE FROM group_join_design WHERE parent_group_id = ${id} AND design_id = ${designId}`, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
    return p;
  }

  function getCount (data) {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT count(*) FROM group_join_design WHERE parent_group_id = ${group} AND is_join = 1`, (err, row) => {
        if (!err) {
          resolve(row[0]["count(*)"]);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  function countUpdate (num) {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE group_counter SET design = ? WHERE group_id = ${group}`, num, (err, row) => {
        if (!err) {
          res.status(200).json({success: true});
        } else {
          console.log(err);
          res.status(500).json({success: false});
        }
      });
    });
  };

  deleteDesign(group, designId)
    .then(getCount)
    .then(countUpdate);
};

// 그룹 가입 승인
exports.acceptGroup = (req, res, next) => {
  const group = req.params.id; // 부모그룹
  const groupId = req.params.groupId; // 가입된 자식그룹

  function acceptGroup (id, groupId) {
    const p = new Promise((resolve, reject) => {
      connection.query(`UPDATE group_join_group SET is_join = 1 WHERE parent_group_id = ${id} AND group_id = ${groupId}`, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
    return p;
  };

  function countUpdate (data) {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE group_counter SET group_counter.group = group_counter.group + 1 WHERE group_id = ${group}`, (err, row) => {
        if (!err) {
          res.status(200).json({success: true});
        } else {
          console.log(err);
          res.status(500).json({success: false});
        }
      });
    });
  };

  acceptGroup(group, groupId)
    .then(countUpdate);
};

// 가입한 & 신청한 그룹 삭제
exports.deleteGroup = (req, res, next) => {
  const group = req.params.id; // 부모그룹
  const groupId = req.params.groupId; // 가입된 자식그룹

  function deleteDesign (id, groupId) {
    const p = new Promise((resolve, reject) => {
      connection.query(`DELETE FROM group_join_group WHERE parent_group_id = ${id} AND group_id = ${groupId}`, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
    return p;
  };

  function getCount (data) {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT count(*) FROM group_join_group WHERE parent_group_id = ${group} AND is_join = 1`, (err, row) => {
        if (!err) {
          resolve(row[0]["count(*)"]);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  function countUpdate (num) {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE group_counter SET group_counter.group = ? WHERE group_id = ${group}`, num, (err, row) => {
        if (!err) {
          res.status(200).json({success: true});
        } else {
          console.log(err);
          res.status(500).json({success: false});
        }
      });
    });
  };

  deleteDesign(group, groupId)
    .then(getCount)
    .then(countUpdate);
};
