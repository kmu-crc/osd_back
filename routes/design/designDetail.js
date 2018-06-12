var connection = require("../../configs/connection");

// 디자인 디테일 정보 가져오기 (GET)
exports.designDetail = (req, res, next) => {
  const designId = req.params.id;
  let loginId;
  if (req.decoded !== null) {
    loginId = req.decoded.uid;
  } else {
    loginId = null;
  }

  // 디자인 기본 정보 가져오기
  function getDesignInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design WHERE uid = ?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 등록자 닉네임 가져오기
  function getName (data) {
    const p = new Promise((resolve, reject) => {
      if (data.user_id === null) {
        data.userName = null;
        resolve(data);
      } else {
        connection.query("SELECT nick_name FROM user WHERE uid = ?", data.user_id, (err, result) => {
          if (!err) {
            data.userName = result[0].nick_name;
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 카테고리 이름 가져오기
  function getCategory (data) {
    const p = new Promise((resolve, reject) => {
      let cate;
      let sql;
      if (!data.category_level1 && !data.category_level2) {
        data.categoryName = null;
        resolve(data);
      } else if (data.category_level2 && data.category_level2 !== "") {
        cate = data.category_level2;
        sql = "SELECT name FROM category_level2 WHERE uid = ?";
      } else {
        cate = data.category_level1;
        sql = "SELECT name FROM category_level1 WHERE uid = ?";
      }
      connection.query(sql, cate, (err, result) => {
        if (!err) {
          data.categoryName = result[0].name;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 좋아요 수, 조회수, 멤버수, 카드수 가져오기
  function getCount (data) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design_counter WHERE design_id = ?", data.uid, (err, row) => {
        if (!err && row.length === 0) {
          data.count = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.count = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 속한 멤버들의 id, 닉네임 리스트 가져오기
  function getMemberList (data) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT D.user_id, U.nick_name FROM design_member D JOIN user U ON U.uid = D.user_id WHERE design_id = ?", data.uid, (err, row) => {
        if (!err && row.length === 0) {
          data.member = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.member = row;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 파생된 디자인 수 가져오기
  function getChildrenCount (data) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT count(*) FROM design WHERE parent_design = ?", data.uid, (err, result) => {
        if (!err) {
          data.children_count = result[0];
          console.log(data);
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 내가 디자인 멤버인지 검증하기
  function isTeam (data) {
    const p = new Promise((resolve, reject) => {
      if (loginId === null) {
        data.is_team = 0;
        resolve(data);
      } else {
        connection.query(`SELECT * FROM design_member WHERE design_id = ${data.uid} AND user_id = ${loginId}`, (err, result) => {
          if (!err && result.length === 0) {
            data.is_team = 0;
            resolve(data);
          } else if (!err && result.length > 0) {
            data.is_team = 1;
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 가장 최근 업데이트된 이슈 제목 가져오기
  function getIssueTitle (data) {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT uid, title, update_time FROM design_issue WHERE design_id = ${data.uid} ORDER BY update_time DESC`, (err, result) => {
        if (!err && result.length === 0) {
          data.mainIssue = null;
          resolve(data);
        } else if (!err && result.length > 0) {
          data.mainIssue = result[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  getDesignInfo(designId)
    .then(getName)
    .then(getCategory)
    .then(getCount)
    .then(getMemberList)
    .then(getChildrenCount)
    .then(isTeam)
    .then(getIssueTitle)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};
