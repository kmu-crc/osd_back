const connection = require("../../configs/connection");

// 디자인 멤버 초대하는 로직 함수로 따로 분리

const getSocketId = (data, uid) => {
  return new Promise((resolve, reject) => {
    //console.log("uid", uid);
    connection.query(`SELECT socket_id FROM opendesign.user WHERE uid = ${uid}`, (err, row) => {
      if (!err && row.length === 0) {
        resolve(null);
      } else if (!err && row.length > 0) {
        resolve({ data, socketId: row[0].socket_id });
      } else {
        //console.log(err);
        reject(err);
      }
    });
  });
};

const getCreateDesignUser = (designId) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT user_id FROM opendesign.design WHERE uid = ${designId}`, (err, row) => {
      if (!err) {
        resolve(row[0].user_id);
      } else {
        //console.log(err);
        reject(err);
      }
    });
  });
}

const joinMemberFn = (req, flag) => {
  return new Promise((resolve, reject) => {
    // console.log(req, flag, "+++");
    let arr = req.members.map(item => {
      return new Promise(async (resolve, reject) => {
        connection.query("INSERT INTO opendesign.design_member SET ?", { design_id: req.design_id, user_id: item.uid, is_join: 0, invited: flag }, async (err, rows) => {
          if (!err) {
            const { sendAlarm } = require("../../socket");
            if (req.decoded.uid !== item.uid && (flag === "1" || flag === 1)) {
              await getSocketId(rows.insertId, item.uid).then(data => sendAlarm(data.socketId, item.uid, req.design_id, (flag === "1" || flag === 1) ? "DesignInvite" : "DesignRequest", req.decoded.uid));
            } else if (flag === "0" || flag === 0) {
              let userId = await getCreateDesignUser(req.design_id);
              await getSocketId(rows.insertId, userId).then(data => sendAlarm(data.socketId, userId, req.design_id, (flag === "1" || flag === 1) ? "DesignInvite" : "DesignRequest", req.decoded.uid));
            }
            resolve(rows.insertId);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        });
      });
    });
    Promise.all(arr)
      .then(() => resolve(true))
      .catch(() => reject(new Error("멤버등록 실패")));
  });
};

// 디자인 멤버 초대 (디자인 처음 생성시)
exports.joinMember = (req) => {
  const flag = 1; // 팀장이 초대
  return joinMemberFn(req, flag);
};

// 디자인 멤버 신청 || 초대
exports.joinDesign = (req, res, next) => {
  const flag = req.params.flag;
  const data = {
    decoded: req.decoded,
    design_id: req.params.id,
    members: req.body
  };

  joinMemberFn(data, flag)
    .then(data => {
      if (data) {
        res.status(200).json({
          design_id: req.params.id,
          success: true
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        design_id: req.params.id,
        success: false,
        err: err
      });
    });
};

// 초대인지 요청인지 구분하는 함수
const whatIsAccept = (designId, memberId) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM opendesign.design_member WHERE user_id = ${memberId} AND design_id = ${designId}`, (err, rows) => {
      if (!err && rows.length !== 0) {
        resolve(rows[0].invited);
      } else {
        console.error(err);
        reject(err);
      }
    });
  });
}

// 디자인 승인하는 로직 따로 분리
const acceptMember = (designId, memberId, isLeader) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE opendesign.design_member SET is_join = 1 WHERE user_id = ${memberId} AND design_id = ${designId}`;
    connection.query(sql, async (err, rows, fields) => {
      if (!err) {
        // 초대인지 요청인지 구분하여 알람 전송 기능을 추가해야함
        let userId = memberId;
        let designerId = await getCreateDesignUser(designId);
        if (!isLeader) {
          console.log("accept design:", 3);
          let invited = await whatIsAccept(designId, memberId);
          console.log("invited", invited, typeof invited);
          const { sendAlarm, getSocketId } = require("../../socket");
          await getSocketId(invited ? designerId : userId)
            .then(socket =>
              sendAlarm(socket.socketId, invited ? designerId : userId, designId, invited === 0 ? "DesignRequestTrue" : "DesignInvitedTrue", invited ? userId : designerId));
        }
        console.log("accept design:", rows.insertId);
        resolve(rows.insertId);
      } else {
        console.error(err);
        console.log("accept design:", 5);
        reject(err);
      }
    });
  });
};

// 카운트 값 가져오기
const getCount = (designId) => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT count(*) FROM opendesign.design_member WHERE design_id = ? AND is_join = 1", designId, (err, result) => {
      if (!err) {
        resolve(result[0]["count(*)"]);
      } else {
        console.log(err);
        reject(err);
      }
    });
  });
};

// 카운트 값 업데이트
const updateCount = (count, designId) => {
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE opendesign.design_counter SET member_count = ${count} WHERE design_id = ${designId}`, (err, row) => {
      if (!err) {
        resolve(row.insertId);
      } else {
        console.log(err);
        reject(err);
      }
    });
  });
};

// 디자인 멤버 승인
exports.acceptMember = (req, res, next) => {
  acceptMember(req.params.id, req.params.member_id)
    .then(() => getCount(req.params.id))
    .then(data => updateCount(data, req.params.id))
    .then(data => {
      console.log("!!!");
      res.status(200).json({
        design_id: req.params.id,
        success: true
      });
    })
    .catch(err => {
      console.log("????");
      res.status(500).json({
        design_id: req.params.id,
        success: false,
        err: err
      });
    });
};

// 디자인 생성 시에 리더를 멤버로 승인
exports.acceptLeader = (designId, userId) => {
  acceptMember(designId, userId, true)
    .then(() => getCount(designId))
    .then(data => updateCount(data, designId));
};

// 디자인 멤버 탈퇴
exports.getoutMember = (req, res, next) => {
  const refuse = req.params.refuse
  const getout = (designId, memberId) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM design_member WHERE user_id = ${memberId} AND design_id = ${designId}`, async (err, rows) => {
        if (!err) {
          //if (refuse) {
          let userId = await getCreateDesignUser(designId);
          const { sendAlarm } = require("../../socket");
          //console.log("?????", userId, memberId);
          if (userId === req.decoded.uid) {
            userId = memberId;
          }
          await getSocketId(rows.insertId, userId).then(data => sendAlarm(data.socketId, userId, designId, refuse, req.decoded.uid));
          //}
          resolve(rows.insertId);
        } else {
          console.error(err);
          reject(err);
        }
      });
    });
  };

  getout(req.params.id, req.params.member_id)
    .then(() => getCount(req.params.id))
    .then(data => updateCount(data, req.params.id))
    .then(data => {
      res.status(200).json({
        design_id: req.params.id,
        success: true
      });
    })
    .catch(err => {
      res.status(500).json({
        design_id: req.params.id,
        success: false,
        err: err
      });
    });
};
exports.getWaitingToAcceptMember = (req, res, next) => {
  const getMember = (designId) => {
    return new Promise((resolve, reject) => {
      connection.query(`
SELECT M.user_id, U.nick_name, T.s_img, T.m_img 
FROM opendesign.design_member M 
JOIN opendesign.user U ON U.uid = M.user_id 
LEFT JOIN opendesign.thumbnail T ON T.user_id = M.user_id AND T.uid = U.thumbnail WHERE design_id = ${designId} AND is_join = 0 AND invited = 1`, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error(err);
          reject(err);
        }
      });
    });
  };
  getMember(req.params.id)
    .then(data => res.status(200).json({ data }))
    .catch(err => res.status(500).json({ err: err }));
};
// 내 디자인에 가입 신청중인 멤버 리스트 가져오기
exports.getWaitingMember = (req, res, next) => {
  const getMember = (designId) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT M.user_id, U.nick_name, T.s_img, T.m_img FROM opendesign.design_member M JOIN user U ON U.uid = M.user_id LEFT JOIN thumbnail T ON T.user_id = M.user_id AND T.uid = U.thumbnail WHERE design_id = ${designId} AND is_join = 0 AND invited = 0`, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error(err);
          reject(err);
        }
      });
    });
  };

  getMember(req.params.id)
    .then(data => {
      res.status(200).json({ data });
    }).catch(err => {
      res.status(500).json({ err: err });
    });
};
