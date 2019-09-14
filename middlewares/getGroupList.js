const connection = require("../configs/connection");

const getGroupList = (req, res, next) => {
  const sql = req.sql;
  console.log(sql);
  // 그룹 리스트 가져오기 (GET)
  function getGroupList (sql) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, (err, row) => {
            //console.log( row);
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          row.map(data => {
            arr.push(newData(data));
          });
          Promise.all(arr).then(result => {
            resolve(result);
          });
        } else {
          console.log("!");
          reject(err);
        }
      });
    });
    //console.log(p);
    return p;
  };

  function newData (group) {
    return new Promise((resolve, reject) => {
    getMyThumbnail(group)
    .then(url => {group.thumbnailUrl = url;return group})
    .then(getUserName)
    .then(name=>{group.userName = name;return group})
    .then(getChildren)
    .then(children=>{group.children = children;return group})
    .then(getViewCount)
    .then(view=>{group.view = view; return group})
    .then(()=>{resolve(group)})
    .catch(err=>{reject(err)})})
  }

  // 그룹 본인의 CHILDREN THUMBNAIL 가져오기
  function getChildren(data) {
    return new Promise((resolve, reject) => {
      if (data.design === 0 && data.group === 0) {
        resolve(null)
      } else {
    const sql=`SELECT m_img FROM opendesign.thumbnail WHERE uid IN (SELECT thumbnail FROM opendesign.group WHERE uid IN (SELECT group_id FROM opendesign.group_join_group WHERE is_join=1 AND parent_group_id=${data.uid})) UNION SELECT m_img FROM opendesign.thumbnail WHERE uid IN (SELECT thumbnail FROM opendesign.design WHERE uid IN (SELECT design_id FROM opendesign.group_join_design WHERE is_join=1 AND parent_group_id=${data.uid}))`
        connection.query(sql, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null)
          } else if (!err && row.length > 0) {
            resolve(row)
          } else {
            return err
          }
        })
      }
    })
  }

  // 그룹 본인의 썸네일 가져오기
  function getMyThumbnail (data) {
    return new Promise((resolve, reject) => {
      if (data.thumbnail === null) {
        resolve(null);
      } else {
        connection.query("SELECT s_img, m_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            resolve(row[0]);
          } else {
            return err;
          }
        });
      }
    });
  };

  // 유저 닉네임 불러오기
  function getUserName (data) {
    return new Promise((resolve, reject) => {
      if (data.user_id === null) {
        resolve(null);
      } else {
        connection.query("SELECT nick_name FROM user WHERE uid = ?", data.user_id, (err, result) => {
          if (!err) {
            resolve(result[0].nick_name);
          } else {
            reject(err);
          }
        });
      }
    });
  };

  // 그룹 포함된 그룹/디자인 썸네일 가져오기
  function getChildrenList(group) {
    const sql=`SELECT m_img FROM opendesign.thumbnail WHERE uid IN (SELECT thumbnail FROM opendesign.group WHERE uid IN (SELECT group_id FROM opendesign.group_join_group WHERE parent_group_id=${group.uid})) UNION SELECT m_img FROM opendesign.thumbnail WHERE uid IN (SELECT thumbnail FROM opendesign.design WHERE uid IN (SELECT design_id FROM opendesign.group_join_design WHERE parent_group_id=${group.uid}))`
    const p =  new Promise((resolve, reject) => {
        connection.query(sql, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null)
          } else if (!err && row.length > 0) {
            resolve(row[0].m_img)
          } else {
            return err
          }
        })
    })
return p
  }

  // 그룹 포함된 디자인 조회수 가져오기
  function getViewCount(group) {
    const sql=`SELECT sum(T.view) AS 'view' FROM (SELECT SUM(view_count) AS 'view' FROM opendesign.design_counter WHERE design_id IN (SELECT design_id FROM opendesign.group_join_design G WHERE G.parent_group_id = ${group.uid}) UNION SELECT SUM(view_count) AS 'view' FROM opendesign.design_counter WHERE design_id IN (SELECT design_id FROM opendesign.group_join_design WHERE parent_group_id IN (SELECT G.group_id FROM opendesign.group_join_group G WHERE G.parent_group_id = ${group.uid}))) AS T
`
    const p =  new Promise((resolve, reject) => {
        connection.query(sql, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null)
          } else if (!err && row.length > 0) {
            resolve(row[0].view)
          } else {
            return err
          }
        })
    })
return p
  }

getGroupList(sql)
  .then(result => {res.status(200).json(result)})
  .catch(err => {res.status(500).json(err)})
}

module.exports = getGroupList
