var connection = require("../../configs/connection");

exports.groupDetail = (req, res, next) => {
  const id = req.params.id;

  // 그룹 정보 가져오기 (GET)
  function getGroupInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM opendesign.group WHERE uid = ?", id, (err, row) => {
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

  // 그룹장 닉네임 가져오기 (GET)
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

  // 그룹 issue 가져오기 (GET)
  function getGroupComment (data) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT uid, user_id, title, create_time, update_time FROM group_issue WHERE group_id = ? ORDER BY create_time DESC", data.uid, (err, row) => {
        if (!err && row.length === 0) {
          data.issue = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.issue = row;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 그룹 썸네일 가져오기 (GET)
  function getThumnbail (data) {
    const p = new Promise((resolve, reject) => {
      if (data.thumbnail === null) {
        data.img = null;
        resolve(data);
      } else {
        connection.query("SELECT s_img, m_img, l_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
          if (!err && row.length === 0) {
            data.img = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.img = row[0];
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 그룹 부모그룹 있는지 확인 후 가져오기
  function getParentInfo (data) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM group_join_group WHERE group_id = ? AND is_join = 1", data.uid, async (err, row) => {
        if (!err && row.length === 0) {
          data.parentName = null;
          data.parentId = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          await connection.query("SELECT title, uid FROM opendesign.group WHERE uid = ?", row[0].parent_group_id, (err, name) => {
            if (!err) {
              data.parentName = name[0].title;
              data.parentId = name[0].uid;
              resolve(data);
            } else {
              data.parentName = null;
              data.parentId = null;
              resolve(data);
            }
          });
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getGroupInfo(id)
    .then(getName)
    .then(getGroupComment)
    .then(getThumnbail)
    .then(getParentInfo)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};

exports.getCount = (req, res, next) => {
  const groupId = req.params.id;
  let design;
  let group;

  // 그룹 디자인 정보 가져오기 (GET)
  function getDesignCount (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT count(*) FROM group_join_design WHERE parent_group_id = ? AND is_join = 1", id, (err, row) => {
        if (!err) {
          design = row[0]["count(*)"];
          resolve(id);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
    return p;
  };

  // 그룹 하위그룹 정보 가져오기 (GET)
  function getGroupCount (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT count(*) FROM group_join_group WHERE parent_group_id = ? AND is_join = 1", id, (err, row) => {
        if (!err) {
          group = row[0]["count(*)"];
          resolve(id);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
    return p;
  };

  // 그룹 count 정보 업데이트
  function updateCount (id) {
    const p = new Promise((resolve, reject) => {
      connection.query(`UPDATE group_counter SET ? WHERE group_id = ${id}`, {design: design, group: group}, (err, row) => {
        if (!err) {
          resolve(id);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
    return p;
  };

  // 그룹 count 정보 가져오기
  function getCount (id) {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM group_counter WHERE group_id = ${id}`, (err, row) => {
        if (!err) {
          res.status(200).json(row[0]);
        } else {
          //console.log(err);
          res.status(500).json(err);
        }
      });
    });
    return p;
  };

  getDesignCount(groupId)
    .then(getGroupCount)
    .then(updateCount)
    .then(getCount);
};
