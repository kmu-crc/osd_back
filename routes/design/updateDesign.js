const connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");
const { insertSource } = require("../../middlewares/insertSource");
const { updateCardDB } = require("../design/designCard");
const { joinMember } = require("../design/joinMember");

// 디자인 정보 수정
exports.updateDesignInfo = (req, res, next) => {
  const designId = req.params.id;
  const designUserId = req.params.uid;
  // req.body["update_time"] = new Date();
  // req.body["update_time"] = new Date(new Date().getTime());
  // delete req.body["update_time"];

  //  if (req.body.category_level1 === 0) {
  //    req.body.category_level1 = null;
  //  }
  //  if (req.body.category_level2 === 0) {
  //    req.body.category_level2 = null;
  //  }

  let members = req.body.members;

  delete req.body.user_id;
  delete req.body.members;

  const alarmSetting = async (data, type) => {
    const { sendAlarm, getSocketId } = require("../../socket");
    getSocketId(data.user_id)
      .then(socket => sendAlarm(socket.socketId, data.user_id, designId, type === "invite" ? "DesignInvite" : "DesignGetout", designUserId, designId));
  };
  const addmember = (data) => {
    const is_join = 0;
    const invited = 1;
    const sql = `INSERT INTO opendesign.design_member VALUES (null, ${designId}, ${data.user_id}, ${is_join}, ${invited})`;
    return new Promise((resolve, reject) => {
      connection.query(sql, (error, result) => {
        if (!error) {
          resolve(true);
        } else {
          reject(false);
        }
      });
    });
  };
  const delmember = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM opendesign.design_member WHERE design_id=${designID} AND user_id=${data.user_id}`, (error, result) => {
        if (!error) {
          resolve(true);
        } else {
          reject(false);
        }
      });
    });
  };
  const manageMember = (mems) => {
    if (mems == null) return true;
    return new Promise((resolve, reject) => {
      let addjobs = mems.add.map(job => {
        addmember(job)
          .then(alarmSetting(job, "invite"))
          .catch(err => reject(err));
      });
      let deljobs = mems.del.map(job => {
        delmember(job)
          .then(alarmSetting(job, "getout"))
          .catch(err => reject(err));
      });
      Promise.all(addjobs).catch(err => reject(err));
      Promise.all(deljobs).catch(err => reject(err));
      resolve(true);
    });
  };
  const updateDesign = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design SET ?, update_time = now() WHERE uid = ${designId}`, data, (err, result) => {
        if (!err) {
          // console.log(result);
          resolve(result);
        } else {
          // console.log(err);
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
          //console.log("detail: ", rows);
          resolve(id);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const clearMember = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM design_member WHERE design_id = ${designId}`, (err, result) => {
        if (!err) {
          //console.log(result);
          resolve(result);
        } else {
          //console.log(err);
          reject(result);
        }
      });
    });
  };

  const updateMemberCount = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design_counter SET member_count = (SELECT count(*) FROM design_member WHERE design_id = ${designId}) WHERE design_id = ${designId}`, (err, result) => {
        if (!err) {
          //console.log(result);
          resolve(result);
        } else {
          //console.log(err);
          reject(result);
        }
      });
    });
  };

  const findParentGroup = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT parent_group_id FROM group_join_design WHERE design_id = ?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(row);
        } else if (!err && row.length > 0) {
          let arr = [];
          row.map(data => {
            arr.push(updateParentGroup(data));
          });
          Promise.all(arr).then(result => {
            resolve(result);
          });
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const updateParentGroup = (row) => {
    return new Promise((resolve, reject) => {
      const now = { "child_update_time": new Date() };
      connection.query(`UPDATE opendesign.group SET ? WHERE uid = ${row.parent_group_id}`, now, (err, result) => {
        if (!err) {
          //console.log("result", result);
          resolve(result);
        } else {
          //console.log(err);
          reject(err);
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

  const updateTIME = () => {
    return new Promise((res, rej) => {
      connection.query(
        `UPDATE design SET update_time = now() WHERE uid = ${designId}`, (err, result) => {
          if (!err) {
            res.status(200).json({ success: true, design_id: designId });
          } else {
            res.status(500).json({ success: false, design_id: designId });
          }
        });
    });
  };

  updateDesign(req.body)
    .then(() => {
      if (req.file == null) {
        return Promise.resolve(null);
      } else {
        return createThumbnails(req.file);
      }
    })
    .then(designUpdata)
    .then(() => findParentGroup(designId))
    .then(() => manageMember(members))
    .then(() => updateMemberCount(designId))
    //.then(() => updateTIME)
    .then(success)
    .catch(fail);
};

exports.updateDesignTime = (req, res, next) => {
  const designId = req.params.id;
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
  const updateTIME = () => {
    return new Promise((res, rej) => {
      connection.query(
        `UPDATE design SET update_time = now() WHERE uid = ${designId}`,
        (err, result) => {
          if (!err) {
            res.status(200).json({ success: true, design_id: designId });
          } else {
            res.status(500).json({ success: false, design_id: designId });
          }
        });
    });
  };
  updateTIME(req.body)
    .then(success)
    .cath(next);
};

