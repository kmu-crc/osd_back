var connection = require("../../configs/connection");

const getSocketId = uid => {
  return new Promise((resolve, reject) => {
    //console.log("uid", uid);
    connection.query(
      `SELECT socket_id FROM user WHERE uid = ${uid}`,
      (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          resolve({ socketId: row[0].socket_id });
        } else {
          //console.log(err);
          reject(err);
        }
      }
    );
  });
};
const getGroupUserId = id => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM opendesign.group WHERE uid=${id}`,
      (err, rows) => {
        if (!err) {
          resolve(rows[0].user_id);
        } else {
          const errorMessage = "그룹가입신청이 실패하였습니다.";
          reject(errorMessage);
        }
      }
    );
  });
};

const getDesignUserId = id => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM design WHERE uid=${id}`,
      (err, rows) => {
        if (!err) {
          resolve(rows[0].user_id);
        } else {
          const errorMessage = "그룹가입신청이 실패하였습니다.";
          reject(errorMessage);
        }
      }
    );
  });
};

const SendSuccessAlarm = async (fromId, contentId, isGroup) => {
  const { sendAlarm } = require("../../socket");
  let designerId = null;
  if (isGroup) {
    designerId = await getGroupUserId(fromId);
  } else {
    designerId = await getDesignUserId(fromId);
  }
  let socket = getSocketId(designerId);
  let toUserId = await getGroupUserId(contentId);
  sendAlarm(
    socket.socketId,
    designerId,
    contentId,
    "JoinGroupSuccess",
    toUserId
  );
};

const SendRefuseAlarm = async (fromId, contentId, isGroup) => {
  const { sendAlarm } = require("../../socket");
  let designerId = null;
  if (isGroup) {
    designerId = await getGroupUserId(fromId);
  } else {
    designerId = await getDesignUserId(fromId);
  }
  let socket = getSocketId(designerId);
  let toUserId = await getGroupUserId(contentId);
  sendAlarm(
    socket.socketId,
    designerId,
    contentId,
    "JoinGroupRefuse",
    toUserId
  );
};

// 디자인 가입 승인
exports.acceptDesign = (req, res, next) => {
  const group = req.params.id;
  const designId = req.params.designId;

  function acceptDesign (id, designId) {
    const p = new Promise((resolve, reject) => {
      connection.query(
        `UPDATE group_join_design SET is_join = 1 WHERE parent_group_id = ${id} AND design_id = ${designId}`,
        (err, row) => {
          if (!err) {
            resolve(row);
          } else {
            //console.log(err);
            reject(err);
          }
        }
      );
    });
    return p;
  }

  function countUpdate (data) {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE group_counter SET design = design + 1 WHERE group_id = ${group}`,
        async (err, row) => {
          if (!err) {
            //console.log("확인", designId, group)
            SendSuccessAlarm(designId, group, false);
            res.status(200).json({ success: true });
          } else {
            res.status(500).json({ success: false });
          }
        }
      );
    });
  }

  acceptDesign(group, designId).then(countUpdate);
};

// 가입한 & 신청한 디자인 삭제
exports.deleteDesign = (req, res, next) => {
  const group = req.params.id;
  const designId = req.params.designId;

  function deleteDesign (id, designId) {
    const p = new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM group_join_design WHERE parent_group_id = ${id} AND design_id = ${designId}`,
        (err, row) => {
          if (!err) {
            resolve(row);
          } else {
            //console.log(err);
            reject(err);
          }
        }
      );
    });
    return p;
  }

  function getCount (data) {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT count(*) FROM group_join_design WHERE parent_group_id = ${group} AND is_join = 1`,
        (err, row) => {
          if (!err) {
            resolve(row[0]["count(*)"]);
          } else {
            //console.log(err);
            reject(err);
          }
        }
      );
    });
  }

  function countUpdate (num) {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE group_counter SET design = ? WHERE group_id = ${group}`,
        num,
        async (err, row) => {
          if (!err) {
            //console.log("확인", designId, group)
            SendRefuseAlarm(designId, group, false);
            res.status(200).json({ success: true });
          } else {
            //console.log(err);
            res.status(500).json({ success: false });
          }
        }
      );
    });
  }

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
      connection.query(
        `UPDATE group_join_group SET is_join = 1 WHERE parent_group_id = ${id} AND group_id = ${groupId}`,
        (err, row) => {
          if (!err) {
            resolve(row);
          } else {
            //console.log(err);
            reject(err);
          }
        }
      );
    });
    return p;
  }

  function countUpdate (data) {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE group_counter SET group_counter.group = group_counter.group + 1 WHERE group_id = ${group}`,
        (err, row) => {
          if (!err) {
            SendSuccessAlarm(groupId, group, true);
            res.status(200).json({ success: true });
          } else {
            //console.log(err);
            res.status(500).json({ success: false });
          }
        }
      );
    });
  }

  acceptGroup(group, groupId).then(countUpdate);
};

// 가입한 & 신청한 그룹 삭제
exports.deleteGroup = (req, res, next) => {
  const group = req.params.id; // 부모그룹
  const groupId = req.params.groupId; // 가입된 자식그룹

  function deleteDesign (id, groupId) {
    const p = new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM group_join_group WHERE parent_group_id = ${id} AND group_id = ${groupId}`,
        (err, row) => {
          if (!err) {
            resolve(row);
          } else {
            //console.log(err);
            reject(err);
          }
        }
      );
    });
    return p;
  }

  function getCount (data) {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT count(*) FROM group_join_group WHERE parent_group_id = ${group} AND is_join = 1`,
        (err, row) => {
          if (!err) {
            resolve(row[0]["count(*)"]);
          } else {
            //console.log(err);
            reject(err);
          }
        }
      );
    });
  }

  function countUpdate (num) {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE group_counter SET group_counter.group = ? WHERE group_id = ${group}`,
        num,
        (err, row) => {
          if (!err) {
            SendRefuseAlarm(groupId, group, true);
            res.status(200).json({ success: true });
          } else {
            //console.log(err);
            res.status(500).json({ success: false });
          }
        }
      );
    });
  }

  deleteDesign(group, groupId)
    .then(getCount)
    .then(countUpdate);
};
