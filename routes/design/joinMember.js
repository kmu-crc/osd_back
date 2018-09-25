const connection = require("../../configs/connection");
const { joinMember } = require("../design/joinMember");

// 디자인 멤버 초대하는 로직 함수로 따로 분리
const joinMemberFn = (req) => {
  return new Promise((resolve, reject) => {
    let arr = req.members.map(item => {
      return new Promise((resolve, reject) => {
        connection.query("INSERT INTO design_member SET ?", {design_id: req.design_id, user_id: item.uid, is_join: 0}, (err, rows) => {
          if (!err) {
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
}

exports.joinMember = (req) => {
  return joinMemberFn(req);
};

// 디자인 멤버 신청 || 초대
exports.joinDesign = (req, res, next) => {
  const data = {
    design_id: req.params.id,
    members: [ { uid: req.decoded.uid } ]
  };

  joinMemberFn(data)
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

// 디자인 멤버 승인
exports.acceptMember = (req, res, next) => {
  const acceptMember = (designId, memberId) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design_member SET ? WHERE user_id = ${memberId} AND design_id = ${designId}`, {is_join: 1}, (err, rows) => {
        if (!err) {
          resolve(rows.insertId);
        } else {
          console.error(err);
          reject(err);
        }
      });
    });
  };

  acceptMember(req.params.id, req.params.member_id)
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

// 디자인 멤버 탈퇴
exports.getoutMember = (req, res, next) => {
  const getout = (designId, memberId) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM design_member WHERE user_id = ${memberId} AND design_id = ${designId}`, (err, rows) => {
        if (!err) {
          resolve(rows.insertId);
        } else {
          console.error(err);
          reject(err);
        }
      });
    });
  };

  getout(req.params.id, req.params.member_id)
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

// 내 디자인에 가입 신청중인 멤버 리스트 가져오기
exports.getWaitingMember = (req, res, next) => {
  const getMember = (designId) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM design_member WHERE design_id = ${designId} AND is_join = 0`, (err, rows) => {
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
      res.status(200).json({data});
    }).catch(err => {
      res.status(500).json({err: err});
    });
};
