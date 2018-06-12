var connection = require("../../configs/connection");

exports.deleteDesign = (req, res, next) => {
  const group = req.params.id;
  const designId = req.params.designId;

  function deleteDesign (id, designId) {
    const p = new Promise((resolve, reject) => {
      connection.query(`DELETE FROM group_join_design WHERE parent_group_id = ${id} AND design_id = ${designId}`, (err, row) => {
        if (!err) {
          res.status(200).json({success: true});
        } else {
          console.log(err);
          res.status(500).json({success: false});
        }
      });
    });
    return p;
  }

  deleteDesign(group, designId);
};

exports.deleteGroup = (req, res, next) => {
  const group = req.params.id; // 부모그룹
  const groupId = req.params.groupId; // 가입된 자식그룹

  function deleteDesign (id, groupId) {
    const p = new Promise((resolve, reject) => {
      connection.query(`DELETE FROM group_join_group WHERE parent_group_id = ${id} AND group_id = ${groupId}`, (err, row) => {
        if (!err) {
          res.status(200).json({success: true});
        } else {
          console.log(err);
          res.status(500).json({success: false});
        }
      });
    });
    return p;
  }

  deleteDesign(group, groupId);
};
