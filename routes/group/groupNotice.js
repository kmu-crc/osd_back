var connection = require("../../configs/connection");

exports.getLastestGroupNotice = (req, res, next) => {
  const group_id = req.params.group_id;
  const getNotice = () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM opendesign.group_notice 
          WHERE group_id LIKE ${group_id}
          ORDER BY update_time DESC
          LIMIT 1`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row ? row[0] : "");
        } else {
          reject(err);
        }
      });
    });
  }

  const success = (data) => {
    res.status(200).json({ success: true, data: data });
  };
  const fail = (err) => {
    console.error("get lastest group notice", err);
    res.status(200).json({ success: false, data: err });
  };

  getNotice()
    .then(success)
    .catch(fail);

};
exports.getTotalCountGroupNotice = (req, res, next) => {
  const group_id = req.params.group_id;

  const getCountNotice = () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT COUNT(*) FROM opendesign.group_notice 
          WHERE group_id LIKE ${group_id}`;

      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row ? row[0]["COUNT(*)"] : 0);
        } else {
          reject(err);
        }
      });
    });
  }

  const success = (data) => {
    res.status(200).json({ success: true, data: data });
  };
  const fail = (err) => {
    console.error("get lastest group notice", err);
    res.status(200).json({ success: false, data: err });
  };

  getCountNotice()
    .then(success)
    .catch(fail);

};
exports.getGroupNoticeList = (req, res, next) => {
  const group_id = req.params.group_id;
  const page = req.params.page;

  const getNoticeList = () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT uid, title, content, update_time, create_time FROM opendesign.group_notice 
          WHERE group_id LIKE ${group_id}
          ORDER BY update_time DESC
          LIMIT ${page * 5}, 5`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row ? row : []);
        } else {
          reject(err);
        }
      });
    });
  }

  const success = (data) => {
    res.status(200).json({ success: true, data: data });
  };
  const fail = (err) => {
    console.error("get group notice list", err);
    res.status(200).json({ success: false, data: err });
  };

  getNoticeList()
    .then(success)
    .catch(fail);
};
exports.createGroupNotice = (req, res, next) => {
  const group_id = req.body.group_id;
  const createNotice = () => {
    return new Promise((resolve, reject) => {
      const obj = { title: req.body.title, content: req.body.content, group_id: group_id };
      const sql = `INSERT INTO opendesign.group_notice SET ?`;
      connection.query(sql, obj, (err, row) => {
        if (!err) {
          resolve(row.insertId);
        } else {
          console.error('GROUP NOTICE CREATE error:', err);
          reject(err);
        }
      });
    });
  }
  const success = () => {
    res.status(200).json({ success: true });
  };
  const fail = () => {
    res.status(200).json({ success: false });
  };
  createNotice()
    // .then(getMemberList)
    // .then(createNoticeReadTotal)
    // .then(makeAlarm)
    .then(success)
    .catch(fail);
  // const getMemberList = (id) => {
  //   return new Promise((resolve, reject) => {
  //     const sql =
  //       `SELECT DISTINCT user_id FROM opendesign.group WHERE uid IN (SELECT group_id
  //         FROM opendesign.group_join_group 
  //         WHERE parent_group_id = ${group_id})
  //       UNION 
  //       SELECT user_id FROM opendesign.design WHERE uid IN (SELECT design_id
  //         FROM opendesign.group_join_design
  //         WHERE parent_group_id = ${group_id})`;
  //     connection.query(sql, (err, row) => {
  //       if (!err) {
  //         const obj = { mem: row.map(raw => raw.user_id), id: id }
  //         console.log("~~~~", obj);
  //         resolve(obj);
  //       } else {
  //         reject(err);
  //       }
  //     });
  //   })
  // }
  // const createNoticeReadTotal = (obj) => {
  //   return new Promise((resolve) => {
  //     console.log("createNoticeReadTotal");
  //     obj.mem.map(async id =>
  //       await createNoticeRead({ notice_id: obj.id, group_id: group_id, user_id: id })
  //     );
  //     resolve(true);
  //   })
  //   // Promise.all(
  //   // obj.map(async user => {
  //   // await createNoticeRead({ notice_id: obj.id, group_id: group_id, user_id: user.user_id });
  //   // })
  //   // ).then(resolve(true));
  // }
  // const createNoticeRead = (obj) => {
  //   return new Promise((resolve, reject) => {
  //     const sql = `INSERT INTO opendesign.group_notice_read SET ?`
  //     console.log("createNoticeRead", obj, sql);
  //     connection.query(sql, obj, (err, _) => {
  //       if (!err) {
  //         resolve(true);
  //       } else {
  //         reject(err);
  //       }
  //     });
  //   });
  // }
  // const makeAlarm = () => {
  //   return new Promise((resolve, reject) => {
  //     ;
  //   });
  // }
};
exports.updateGroupNotice = (req, res, next) => {
  const notice_id = req.body.notice_id;
  const updateNotice = () => {
    return new Promise((resolve, reject) => {
      const obj = { title: req.body.title, content: req.body.content.replace('\'', '\\\'') };
      const sql = `UPDATE opendesign.group_notice SET title='${obj.title}',content='${obj.content}', update_time=NOW() WHERE uid=${notice_id}`;
      // console.log(sql);
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row.insertId);
        } else {
          console.error('GROUP NOTICE CREATE error:', err);
          reject(err);
        }
      });
    });
  }
  const success = () => {
    res.status(200).json({ success: true });
  };
  const fail = () => {
    res.status(200).json({ success: false });
  };
  updateNotice()
    .then(success)
    .catch(fail);
};
exports.deleteGroupNotice = (req, res, _) => {
  const notice_id = req.params.id;
  const delete_group_notice = (id) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM opendesign.group_notice WHERE uid=${id};`;
      connection.query(sql, (err, _) => {
        if (err) {
          console.error("DELETE GROUP NOTICE ERROR:", err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  };

  const success = () => { res.status(200).json({ success: true }); }
  const error = (err) => { res.status(500).json({ success: false, message: err }); }

  delete_group_notice(notice_id)
    .then(success)
    .catch(error);
}
