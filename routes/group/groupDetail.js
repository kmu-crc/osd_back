var connection = require("../../configs/connection");

exports.groupDetail = (req, res, next) => {
  const id = req.params.id;

  // 그룹 정보 가져오기 (GET)
  function getGroupInfo(id) {
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
  function getName(data) {
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
  function getGroupComment(data) {
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
  function getThumnbail(data) {
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
  function getParentInfo(data) {
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
  // 그룹 parent Group 가져오기 (GET)
  function getParentGroup(data) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT G.uid AS parent_group, G.title AS parent_title FROM opendesign.group G WHERE G.uid IN (SELECT parent_group_id FROM opendesign.group_join_group WHERE group_id=?)", data.uid, (err, row) => {
        if (!err && row.length === 0) {
          data.parent_group = null;
          data.parent_title = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.parent_group = row[0].parent_group;
          data.parent_title = row[0].parent_title;
		console.log(data.parent_group, data.parent_title)
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };
  // 그룹 grand-parent Group 가져오기 (GET)
  function getGrandParentGroup(data) {
    const p = new Promise((resolve, reject) => {
      if(!data.parentId) resolve(data);
      connection.query("SELECT G.uid AS grand_parent_group, G.title AS grand_parent_title FROM opendesign.group G WHERE G.uid IN (SELECT parent_group_id FROM opendesign.group_join_group WHERE group_id=?)", data.parentId, (err, row) => {
        if (!err && row.length === 0) {
          data.grand_parentId = null;
          data.grand_parentName = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.grand_parentId = row[0]["grand_parent_group"];
          data.grand_parentTitle = row[0]["grand_parent_title"];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };
  function getCount(data) {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT GC.like, GC.design, GC.group FROM group_counter GC WHERE group_id = ${data.uid}`, (err, row) => {
        if (!err) {
          data.like = row[0]["like"];
          data.design = row[0]["design"];
          data.group = row[0]["group"];
          resolve(data);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
    return p;
  };
  function getViewCount(data) {
    const sql=`SELECT sum(T.view) AS 'view' FROM (SELECT SUM(view_count) AS 'view' FROM opendesign.design_counter WHERE design_id IN (SELECT design_id FROM opendesign.group_join_design G WHERE G.parent_group_id = ${data.uid}) UNION SELECT SUM(view_count) AS 'view' FROM opendesign.design_counter WHERE design_id IN (SELECT design_id FROM opendesign.group_join_design WHERE parent_group_id IN (SELECT G.group_id FROM opendesign.group_join_group G WHERE G.parent_group_id = ${data.uid}))) AS T
`
    const p =  new Promise((resolve, reject) => {
        connection.query(sql, (err, row) => {
          if (!err) {
	    data.view = row[0]["view"];
            resolve(data);
          } else if (!err && row.length > 0) {
            reject(err);
	  }         
	})
    })
    return p;
  }


  getGroupInfo(id)
    .then(getName)
    .then(getGroupComment)
    .then(getThumnbail)
    .then(getParentInfo)
    //.then(getParentGroup)
    .then(getGrandParentGroup) 
    .then(getCount)
    .then(getViewCount)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
exports.getCountDesignGroupInGroup = (req, res, next) => {
  const groupId = req.params.id
  const userId = req.params.uid
  function getCount(groupId, userId) {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT (SELECT COUNT(*) FROM group_join_design WHERE parent_group_id=${groupId} AND design_id IN (SELECT uid FROM opendesign.design WHERE user_id = ${userId})) + (SELECT COUNT(*) FROM group_join_group WHERE parent_group_id=${groupId} AND group_id IN (SELECT uid FROM opendesign.group WHERE user_id = ${userId})) AS \`count\``, (err, row) => {
          if (!err) {
            resolve(row[0]["count"])
          } else {
            resolve(null)
          }
        })
    })
  }
  getCount(groupId, userId)
    .then(rst => res.status(200).json(rst))
    .catch(err => console.log("groupDetail.js :", err))
}
exports.getCount = (req, res, next) => {
  const groupId = req.params.id;
  let design;
  let group;
  let view;

  // 그룹 디자인 정보 가져오기 (GET)
  function getDesignCount(id) {
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
  function getGroupCount(id) {
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
 // 그룹 포함된 디자인 조회수 가져오기
  function getViewCount(id) {
    const sql=`SELECT sum(T.view) AS 'view' FROM (SELECT SUM(view_count) AS 'view' FROM opendesign.design_counter WHERE design_id IN (SELECT design_id FROM opendesign.group_join_design G WHERE G.parent_group_id = ${id}) UNION SELECT SUM(view_count) AS 'view' FROM opendesign.design_counter WHERE design_id IN (SELECT design_id FROM opendesign.group_join_design WHERE parent_group_id IN (SELECT G.group_id FROM opendesign.group_join_group G WHERE G.parent_group_id = ${id}))) AS T
`
    const p =  new Promise((resolve, reject) => {
        connection.query(sql, (err, row) => {
          if (!err) {
	    view = row[0]["view"]
            resolve(id);
          } else if (!err && row.length > 0) {
            reject(err);
	  }         
	})
    })
    return p
  }


  // 그룹 count 정보 업데이트
  function updateCount(id) {
    const p = new Promise((resolve, reject) => {
      connection.query(`UPDATE group_counter SET ? WHERE group_id = ${id}`, { design: design, group: group }, (err, row) => {
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
  function getCount(id) {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM group_counter WHERE group_id = ${id}`, (err, row) => {
        if (!err) {
	  row[0].view = view;
console.log(row[0]);
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
    .then(getViewCount)
    .then(updateCount)
    .then(getCount);
};
