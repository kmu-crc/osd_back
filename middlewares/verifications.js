var connection = require("../configs/connection");

exports.isOnlyNicName = (name) => {
  const p = new Promise((resolve, reject) => {
    connection.query(`SELECT count(nick_name) FROM user WHERE nick_name='${name}'`, (err, rows) => {
      if (!err) {
        if (rows[0]["count(nick_name)"] === 0) {
          resolve(true);
        } else {
          const errorMessage = "중복된 닉네임입니다.";
          reject(errorMessage);
        }
      } else {
        reject(err);
      }
    });
  });
  return p;
};

exports.isOnlyEmail = (email) => {
  const p = new Promise((resolve, reject) => {
    connection.query(`SELECT count(email) FROM user WHERE email='${email}'`, (err, rows) => {
      if (!err) {
        if (rows[0]["count(email)"] === 0) {
          resolve(rows);
        } else {
          const errorMessage = "중복된 E-Mail입니다.";
          reject(errorMessage);
        }
      } else {
        reject(err);
      }
    });
  });
  return p;
};

exports.isOnlyFBId = (FBId) => {
  const p = new Promise((resolve, reject) => {
    connection.query(`SELECT count(FB_user_id) FROM user WHERE FB_user_id='${FBId}'`, (err, rows) => {
      if (!err) {
        if (rows[0]["count(FB_user_id)"] === 0) {
          resolve(true);
        } else {
          const errorMessage = "이미 회원입니다.";
          reject(errorMessage);
        }
      } else {
        reject(err);
      }
    });
  });
  return p;
};

exports.isUserDetail = (userId) => {
  const p = new Promise((resolve, reject) => {
    connection.query(`SELECT count(user_id) FROM user_detail WHERE user_id='${userId}'`, (err, rows) => {
      if (!err) {
        if (rows[0]["count(user_id)"] === 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      } else {
        reject(err);
      }
    });
  });
  return p;
};

exports.isOnlyCountryName = (name) => {
  const p = new Promise((resolve, reject) => {
    connection.query(`SELECT count(name) FROM country WHERE name='${name}'`, (err, rows) => {
      if (!err) {
        if (rows[0]["count(name)"] === 0) {
          resolve(name);
        } else {
          const err = "이미 등록된 국가입니다.";
          reject(err);
        }
      } else {
        reject(err);
      }
    });
  });
  return p;
};

exports.isOnlySidoName = (name) => {
  const p = new Promise((resolve, reject) => {
    connection.query(`SELECT count(name) FROM sido WHERE name='${name}'`, (err, rows) => {
      if (!err) {
        if (rows[0]["count(name)"] === 0) {
          resolve(name);
        } else {
          const err = "이미 등록된 도시입니다.";
          reject(err);
        }
      } else {
        reject(err);
      }
    });
  });
  return p;
};
