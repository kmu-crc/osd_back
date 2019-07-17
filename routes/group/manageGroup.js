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
  await getGroupUserId(contentId)
    .then(recevier => getSocketId(designerId))
    .then((socket, receiver) =>
      sendAlarm(socket.socketId, designerId, contentId, "JoinGroupSuccess", receiver))
};

const SendRefuseAlarm = async (fromId, contentId, joined, isGroup) => {
  const { sendAlarm } = require("../../socket");
  let designerId = null;
  if (isGroup) {
    designerId = await getGroupUserId(fromId);
  } else {
    designerId = await getDesignUserId(fromId);
  }
  await getGroupUserId(contentId)
    .then(receiver => getSocketId(designerId))
    .then((socket, recevier) =>
      sendAlarm(socket.socketId, designerId, contentId, joined?"DesignOutFromGroup":"JoinGroupRefuse", recevier));
};

// 디자인 가입 승인
const getSocketGroup = (groupId) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT uid, socket_id FROM opendesign.user 
      WHERE uid IN (SELECT user_id FROM opendesign.group WHERE uid=${groupId})`,
      (err, row) => {
        if (!err) {
          if (row.length < 1) {
            resolve(null)
          } else {
            resolve({ user_id: row[0].uid, socketId: row[0].socket_id })
          }
        } else {
          reject(err)
        }
      })
  })
}
exports.acceptDesign = (req, res, next) => {
  const group = req.params.id;
  const designId = req.params.designId;

  function acceptDesign(id, designId) {
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

  function countUpdate(data) {
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

  function confirmAlarm(group, designId) {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE opendesign.alarm A SET A.confirm = 1 
      WHERE  A.type="GROUP" AND A.kinds="JOIN_withDESIGN" AND A.sub_content_id=${designId} AND A.content_id=${group}`, (err, row) => {
          if (!err) {
            const { getAlarm } = require("../../socket")
            getSocketGroup(group)
              .then(data => getAlarm(data.socketId, data.user_id))
              .then(resolve(true))
          } else {
            reject(err)
          }
        })
    })
  }
  acceptDesign(group, designId)
    .then(confirmAlarm(group, designId))
    .then(countUpdate)
    .catch(err => console.log(err))
};

// 가입한 & 신청한 디자인 삭제
exports.deleteDesign = (req, res, next) => {
  const group = req.params.id;
  const designId = req.params.designId;
  let joined = false

  function deleteDesign(id, designId) {
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

  function getCount(data) {
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

  function countUpdate(num) {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE group_counter SET design = ? WHERE group_id = ${group}`,
        num,
        async (err, row) => {
          if (!err) {
            //console.log("확인", designId, group)
            SendRefuseAlarm(designId, group, joined, false);
            res.status(200).json({ success: true });
          } else {
            //console.log(err);
            res.status(500).json({ success: false });
          }
        }
      );
    });
  }

  function confirmAlarm(group, designId) {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE opendesign.alarm A SET A.confirm = 1 
      WHERE  A.type="GROUP" AND A.kinds="JOIN_withDESIGN" AND A.sub_content_id=${designId} AND A.content_id=${group}`, (err, row) => {
          if (!err) {
            const { getAlarm } = require("../../socket")
            getSocketGroup(group)
              .then(data => getAlarm(data.socketId, data.user_id))
              .then(resolve(true))
          } else {
            reject(err)
          }
        })
    })
  }
  function isJoined(group, design) {
    return new Promise((resolve, reject) => {
	connection.query(`SELECT is_join FROM opendesign.group_join_design WHERE parent_group_id=${group} AND design_id=${design}`,
	(err, rst) => {
	  if (!err) {
		joined = rst[0].is_join
		resolve(true)
	  } else {
		reject(err)
	  }
	})
    })
  }
  isJoined(group, designId)
    .then(deleteDesign(group, designId))
    .then(confirmAlarm(group, designId))
    .then(getCount)
    .then(countUpdate);
};

// 그룹 가입 승인
exports.acceptGroup = (req, res, next) => {
  const group = req.params.id; // 부모그룹
  const groupId = req.params.groupId; // 가입된 자식그룹

  function acceptGroup(id, groupId) {
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
  function countUpdate(data) {
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
  function confirmAlarm(group, groupId) {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE opendesign.alarm A SET A.confirm = 1 
      WHERE  A.type="GROUP" AND A.kinds="JOIN_withGROUP" AND A.sub_content_id=${groupId} AND A.content_id=${group}`, (err, row) => {
          if (!err) {
            const { getAlarm } = require("../../socket")
            getSocketGroup(group)
              .then(data => getAlarm(data.socketId, data.user_id))
              .then(resolve(true))
          } else {
            reject(err)
          }
        })
    })
  }
  acceptGroup(group, groupId)
    .then(confirmAlarm(group, groupId))
    .then(countUpdate)
    .catch(err => console.log(err))
};

// 가입한 & 신청한 그룹 삭제
exports.deleteGroup = (req, res, next) => {
  const group = req.params.id; // 부모그룹
  const groupId = req.params.groupId; // 가입된 자식그룹

  function deleteDesign(id, groupId) {
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

  function getCount(data) {
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

  function countUpdate(num) {
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
  function confirmAlarm(group, groupId) {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE opendesign.alarm A SET A.confirm = 1 
      WHERE  A.type="GROUP" AND A.kinds="JOIN_withGROUP" AND A.sub_content_id=${groupId} AND A.content_id=${group}`, (err, row) => {
          if (!err) {
            const { getAlarm } = require("../../socket")
            getSocketGroup(group)
              .then(data => getAlarm(data.socketId, data.user_id))
              .then(resolve(true))
          } else {
            reject(err)
          }
        })
    })
  }
  deleteDesign(group, groupId)
    .then(confirmAlarm(group, groupId))
    .then(getCount)
    .then(countUpdate);
};
