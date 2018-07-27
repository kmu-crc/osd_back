const connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");
const { insertSource } = require("../../middlewares/insertSource");
const { updateCardDB } = require("../design/designCard");
const { joinMember } = require("../design/joinMember");

// 디자인 정보 수정
exports.updateDesignInfo = (req, res, next) => {
  const designId = req.params.id;
  req.body["update_time"] = new Date();

  if (req.body.category_level1 === 0) {
    req.body.category_level1 = null;
  }
  if (req.body.category_level2 === 0) {
    req.body.category_level2 = null;
  }

  let members = JSON.parse(req.body.member);
  if (members.length === 0) {
    members.push({uid: req.decoded.uid});
  }
  delete req.body.member;

  const updateDesign = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design SET ? WHERE uid = ${designId}`, data, (err, result) => {
        if (!err) {
          console.log(result);
          resolve(result);
        } else {
          console.log(err);
          reject(result);
        }
      });
    });
  };

  const designUpdata = (id) => {
    let info = req.body;
    if (id !== null) {
      info.thumbnail = id;
    }
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design SET ? WHERE uid = ${designId}`, info, (err, rows) => {
        if (!err) {
          console.log("detail: ", rows);
          resolve(id);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  const clearMember = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM design_member WHERE design_id = ${designId}`, (err, result) => {
        if (!err) {
          console.log(result);
          resolve(result);
        } else {
          console.log(err);
          reject(result);
        }
      });
    });
  };

  const updateMemberCount = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design_counter SET member_count = (SELECT count(*) FROM design_member WHERE design_id = ${designId}) WHERE design_id = ${designId}`, (err, result) => {
        if (!err) {
          console.log(result);
          resolve(result);
        } else {
          console.log(err);
          reject(result);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true,
      design_id: designId
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  updateDesign(req.body)
    .then(() => {
      if (req.file == null) {
        return Promise.resolve(null);
      } else {
        return createThumbnails({ uid: req.decoded.uid, image: req.file });
      }
    }).then(designUpdata)
    .then(clearMember)
    .then(() => {
      return joinMember({design_id: designId, members});
    })
    .then(() => updateMemberCount(designId))
    .then(success)
    .catch(fail);
};
