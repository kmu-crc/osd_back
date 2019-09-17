const connection = require("../configs/connection");
// 닉네임이 중복되는지 확인하는 로직
exports.isOnlyNicName = (name, userId) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT nick_name, uid FROM user WHERE nick_name='${name}'`, (err, rows) => {
      if (!err) {
        if (rows.length === 0) {
          resolve(true);
        } else {
          if (userId && userId === rows[0].uid) {
            resolve(true);
          } else {
            const errorMessage = "중복된 닉네임입니다.";
	console.log(errorMessage);
            reject(errorMessage);
          }
        }
      } else {
        const errorMessage = "isOnlyNicName err : " + err;
        reject(errorMessage);
      }
    });
  });
};
// email이 중복되는지 확인하는 로직
exports.isOnlyEmail = (email) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT count(email) FROM user WHERE email='${email}'`, (err, rows) => {
      if (!err) {
        if (rows[0]["count(email)"] === 0) {
          resolve(rows);
        } else {
          const errorMessage = "중복된 E-Mail입니다.";
	console.log(errorMessage);
          reject(errorMessage);
        }
      } else {
        const errorMessage = "isOnlyEmail err : " + err;
        reject(errorMessage);
      }
    });
  });
};
// 페이스북으로 가입하기한 이력이 잇는지 확인하는 로직
exports.isOnlyFBId = (FBId) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT count(FB_user_id) FROM user WHERE FB_user_id='${FBId}'`, (err, rows) => {
      if (!err) {
        if (rows[0]["count(FB_user_id)"] === 0) {
          resolve(true);
        } else {
          const errorMessage = "이미 회원입니다.";
          reject(errorMessage);
        }
      } else {
        const errorMessage = "isOnlyFBId err : " + err;
        reject(errorMessage);
      }
    });
  });
};
// 작성자의 uid로 user_detail이 작성된 이력이 있는지 확인하는 로직
exports.isUserDetail = (userId) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT count(user_id) FROM user_detail WHERE user_id='${userId}'`, (err, rows) => {
      if (!err) {
        if (rows[0]["count(user_id)"] === 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      } else {
        const errorMessage = "isUserDetail err : " + err;
        reject(errorMessage);
      }
    });
  });
};
// 국가가 중복되는지 확인하는 로직
exports.isOnlyCountryName = (name) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT count(name) FROM country WHERE name='${name}'`, (err, rows) => {
      if (!err) {
        if (rows[0]["count(name)"] === 0) {
          resolve(name);
        } else {
          const errorMessage = "이미 등록된 국가입니다.";
          reject(errorMessage);
        }
      } else {
        const errorMessage = "isOnlyCountryName err : " + err;
        reject(errorMessage);
      }
    });
  });
};
// 도시가 중복되는지 화인하는 로직
exports.isOnlySidoName = (name) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT count(name) FROM sido WHERE name='${name}'`, (err, rows) => {
      if (!err) {
        if (rows[0]["count(name)"] === 0) {
          resolve(name);
        } else {
          const errorMessage = "이미 등록된 도시입니다.";
          reject(errorMessage);
        }
      } else {
        const errorMessage = "isOnlySidoName err : " + err;
        reject(errorMessage);
      }
    });
  });
};
// 전달받은 user_id가 존재하는지 확인하는 로직
exports.isMember = (uid) => {
  //console.log("isMember");
  return new Promise((resolve, reject) => {
    connection.query(`SELECT count(uid) FROM user WHERE uid='${uid}'`, (err, rows) => {
      //console.log("rows", rows);
      if (!err) {
        if (rows[0]["count(uid)"] > 0) {
          resolve(uid);
        } else {
          const errorMessage = "이미 탈퇴한 회원입니다.";
          reject(errorMessage);
        }
      } else {
        const errorMessage = "isMember err : " + err;
        reject(errorMessage);
      }
    });
  });
};
// group uid로 group이 존재하는지 확인하는 로직
exports.isGroup = (uid) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT count(uid) FROM opendesign.group WHERE uid=${uid}`, (err, rows) => {
      //console.log("rows", rows);
      if (!err) {
        if (rows[0]["count(uid)"] > 0) {
          resolve(uid);
        } else {
          const errorMessage = "존재하지 않는 그룹입니다.";
          reject(errorMessage);
        }
      } else {
        const errorMessage = "isGroup err : " + err;
        reject(errorMessage);
      }
    });
  });
};
// design uid로 design 존재하는지 확인하는 로직
exports.isDesign = (uid) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT count(uid) FROM design WHERE uid=${uid}`, (err, rows) => {
      //console.log("rows", rows);
      if (!err) {
        if (rows[0]["count(uid)"] > 0) {
          resolve(uid);
        } else {
          const errorMessage = "존재하지 않는 디자인입니다.";
          reject(errorMessage);
        }
      } else {
        const errorMessage = "isDesign err : " + err;
        reject(errorMessage);
      }
    });
  });
};
