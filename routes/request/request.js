const connection = require("../../configs/connection");

// GET REQUEST
exports.GetRequest = (req, res, next) => {
  const type = req.params.type;
  const page = req.params.page;
  const cate1 = req.params.cate1 === 'undefined' || req.params.cate1 === 'null' ? null : req.params.cate1;
  const cate2 = req.params.cate2 === 'undefined' || req.params.cate2 === 'null' ? null : req.params.cate2;
  const sort = req.params.sort === 'undefined' || req.params.sort === 'null' ? 'update' : req.params.sort;
  const keyword = req.params.keyword === 'undefined' || req.params.keyword === 'null' ? null : req.params.keyword;
  console.log(`requst / list / ${type} / ${page} / ${cate1} / ${cate2} / ${sort} / ${keyword}`);

  const getRequest = () => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT * FROM market.request Q WHERE group_id IN (
        SELECT DISTINCT group_id FROM market.request Q WHERE Q.type='${type}' AND Q.completed NOT LIKE 1 AND Q.personal IS NULL 
        ${cate2 ? `AND category_level2=${cate2}` : cate1 ? `AND category_level1=${cate1}` : ``})
      ORDER BY Q.group_id ${sort === 'update' ? 'DESC' : 'ASC'}, Q.sort_in_group ASC
      LIMIT ${page * 10}, 10`
      console.log(sql);
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          reject(err);
        }
      });
    });
  };
  const getUserName = request => {
    return new Promise((resolve, reject) => {
      const sql =
        (request.sort_in_group === 0)
          ? `SELECT nick_name FROM market.user WHERE uid = ${request.client_id} `
          : `SELECT nick_name FROM market.user WHERE uid = ${request.expert_id} `;
      // console.log(sql);
      connection.query(sql, (err, row) => {
        if (!err && row) {
          resolve(row[0] ? row[0]["nick_name"] : null);
        }
        else
          reject(err);
      });
    });
  };
  const getAllUserName = requests => {
    return new Promise((resolve, reject) => {
      Promise.all(
        requests.map(async item => {
          item.nick_name = await getUserName(item);
          return item;
        }))
        .then(list => {
          resolve(list)
        })
        .catch(err => reject(err))
    })
  }
  const getTotalCount = () => {
    return new Promise((resolve, reject) => {
      const sql =
        `SELECT COUNT(*) AS 'total' FROM market.request Q
      WHERE Q.type = "${type}" AND Q.completed NOT LIKE 1`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row[0]["total"]);
        } else {
          reject(err);
        }
      });
    });
  };

  const success = data => { res.status(200).json({ success: true, data: data }) };
  const failure = err => { res.status(500).json({ success: false, data: err }) };

  let data = null;
  getRequest()
    .then(getAllUserName)
    .then(requests => {
      data = { requests: requests };
      return getTotalCount();
    })
    .then(total => {
      data = { ...data, total: total };
      return data;
    })
    .then(success)
    .catch(failure);
};

// Get Designer Request
exports.GetDesignerRequest = (req, res, next) => {
  const id = req.params.id;
  const type = req.params.type;
  const page = req.params.page;

  const getRequest = () => {
    return new Promise((resolve, reject) => {
      const sql =
        `SELECT * FROM market.request Q
      WHERE Q.personal LIKE '${id}' AND Q.type LIKE 'designer'
      ORDER BY Q.group_id DESC, Q.sort_in_group ASC
      LIMIT ${ page * 10}, 10`;

      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          reject(err);
        }
      });
    });
  };
  const getUserName = request => {
    return new Promise((resolve, reject) => {
      const sql =
        (request.sort_in_group === 0)
          ? `SELECT nick_name FROM market.user WHERE uid = ${request.client_id} `
          : `SELECT nick_name FROM market.user WHERE uid = ${request.expert_id} `;
      // console.log(sql);
      connection.query(sql, (err, row) => {
        if (!err && row) {
          resolve(row[0]["nick_name"]);
        }
        else
          reject(err);
      });
    });
  };
  const getAllUserName = requests => {
    return new Promise((resolve, reject) => {
      Promise.all(
        requests.map(async item => {
          item.nick_name = await getUserName(item);
          return item;
        }))
        .then(list => {
          resolve(list)
        })
        .catch(err => reject(err))
    })
  }
  const getTotalCount = () => {
    return new Promise((resolve, reject) => {
      const sql =
        `SELECT COUNT(*) AS 'total' FROM market.request Q
      WHERE Q.type = "${type}" AND Q.completed NOT LIKE 1`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row[0]["total"]);
        } else {
          reject(err);
        }
      });
    });
  };

  const success = data => { res.status(200).json({ success: true, data: data }) };
  const failure = err => { res.status(500).json({ success: false, data: err }) };

  let data = null;
  getRequest()
    .then(getAllUserName)
    .then(requests => {
      data = { requests: requests };
      return getTotalCount();
    })
    .then(total => {
      data = { ...data, total: total };
      return data;
    })
    .then(success)
    .catch(failure);
};

// Get Maker Request
exports.GetMakerRequest = (req, res, next) => {
  const id = req.params.id;
  const type = req.params.type;
  const page = req.params.page;

  const getRequest = () => {
    return new Promise((resolve, reject) => {
      const sql =
        `SELECT * FROM market.request Q
      WHERE Q.personal LIKE '${id}' AND Q.type LIKE 'maker'
      ORDER BY Q.group_id DESC, Q.sort_in_group ASC
      LIMIT ${ page * 10}, 10`;

      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          reject(err);
        }
      });
    });
  };
  const getUserName = request => {
    return new Promise((resolve, reject) => {
      const sql =
        (request.sort_in_group === 0)
          ? `SELECT nick_name FROM market.user WHERE uid = ${request.client_id} `
          : `SELECT nick_name FROM market.user WHERE uid = ${request.expert_id} `;
      // console.log(sql);
      connection.query(sql, (err, row) => {
        if (!err && row) {
          resolve(row[0]["nick_name"]);
        }
        else
          reject(err);
      });
    });
  };
  const getAllUserName = requests => {
    return new Promise((resolve, reject) => {
      Promise.all(
        requests.map(async item => {
          item.nick_name = await getUserName(item);
          return item;
        }))
        .then(list => {
          resolve(list)
        })
        .catch(err => reject(err))
    })
  }
  const getTotalCount = () => {
    return new Promise((resolve, reject) => {
      const sql =
        `SELECT COUNT(*) AS 'total' FROM market.request Q
      WHERE Q.type = "${type}" AND Q.completed NOT LIKE 1; `;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row[0]["total"]);
        } else {
          reject(err);
        }
      });
    });
  };

  const success = data => { res.status(200).json({ success: true, data: data }) };
  const failure = err => { res.status(500).json({ success: false, data: err }) };

  let data = null;
  getRequest()
    .then(getAllUserName)
    .then(requests => {
      data = { requests: requests };
      return getTotalCount();
    })
    .then(total => {
      data = { ...data, total: total };
      return data;
    })
    .then(success)
    .catch(failure);
};

//Create Request
exports.CreateRequest = (req, res, next) => {
  let data = { ...req.body };

  const update_sort = () => {
    // 1.UPDATE BOARD SET SORTS = SORTS + 1 
    // WHERE BGROUP =  (원글의 BGROUP)  AND SORTS >(원글의 SORTS)
    return new Promise((resolve, reject) => {
      if (data.group_id == null) resolve(id);
      const sql = `UPDATE market.request SET sort_in_group = sort_in_group + 1
      WHERE group_id = ${ data.group_id} AND sort_in_group > ${data.sort_in_group} `;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  }
  const answer = id => {
    // 2. INSERT INTO BOARD VALUES (번호, (원글의 BGROUP), (원글의 SORTS +1), (원글의 DEPTH +1) ,' 제목')
    return new Promise((resolve, reject) => {
      if (data.expert_id !== "null" && data.expert_id) {
        data.expert_id = parseInt(data.expert_id, 10);
      } else {
        delete data.expert_id;
      }
      if (data.personal !== "null" && data.personal) {
        data.personal = parseInt(data.personal, 10);
      } else {
        delete data.personal;
      }
      const obj = { ...data, group_id: data.group_id, sort_in_group: data.sort_in_group + 1, expert_id: id };
      const sql = `INSERT INTO market.request SET ? `;
      connection.query(sql, obj, (err, row) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  };
  const create_request = (id) => {
    return new Promise((resolve, reject) => {
      // console.log("create_request:", data);
      if (data.expert_id !== "null" && data.expert_id) {
        data.expert_id = parseInt(data.expert_id, 10);
      } else {
        delete data.expert_id;
      }
      if (data.personal !== "null" && data.personal) {
        data.personal = parseInt(data.personal, 10);
      } else {
        delete data.personal;
      }

      const obj = { ...data, sort_in_group: 0, client_id: id };
      const sql = `INSERT INTO market.request SET ? `;
      console.log(sql, obj);
      connection.query(sql, obj, (err, row) => {
        if (!err) {
          resolve(row.insertId);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };
  const give_group_id = id => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE market.request SET group_id = ${id} WHERE uid = ${id} `;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  };
  const respond = () => { res.status(200).json({ success: true, id: data.personal || null, message: "글 작성을 완료하였습니다." }) };
  const error = () => { res.status(500).json({ message: "so what?" }) };

  // request
  if (!data.group_id) {
    create_request(req.decoded.uid)
      .then(give_group_id)
      .then(respond)
      .catch(error);
  } else {
    update_sort()
      .then(answer(req.decoded.uid))
      .then(respond)
      .catch(error);
  }
};




//////////////////////// my request list
exports.GetMyDesignerRequest = (req, res, next) => {
  const id = req.params.id;
  const type = req.params.type;
  const page = req.params.page;

  const getRequest = () => {
    return new Promise((resolve, reject) => {
      const sql =
        `SELECT * FROM market.request Q
      WHERE group_id IN
        (SELECT DISTINCT group_id FROM market.request Q 
              WHERE(client_id = ${ id} OR expert_id = ${id}) AND Q.type LIKE 'designer' AND Q.status NOT LIKE 'normal')
      LIMIT ${ page * 10}, 10`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          reject(err);
        }
      });
    });
  };
  const getUserName = request => {
    return new Promise((resolve, reject) => {
      const sql =
        (request.sort_in_group === 0)
          ? `SELECT nick_name FROM market.user WHERE uid = ${request.client_id} `
          : `SELECT nick_name FROM market.user WHERE uid = ${request.expert_id} `;
      // console.log(sql);
      connection.query(sql, (err, row) => {
        if (!err && row) {
          resolve(row[0]["nick_name"]);
        }
        else
          reject(err);
      });
    });
  };
  const getAllUserName = requests => {
    return new Promise((resolve, reject) => {
      Promise.all(
        requests.map(async item => {
          item.nick_name = await getUserName(item);
          return item;
        }))
        .then(list => {
          resolve(list)
        })
        .catch(err => reject(err))
    })
  }
  const getTotalCount = () => {
    return new Promise((resolve, reject) => {
      const sql =
        `SELECT COUNT(*) AS 'total' FROM market.request Q
      WHERE Q.type = "${type}" AND Q.completed NOT LIKE 1`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row[0]["total"]);
        } else {
          reject(err);
        }
      });
    });
  };

  const success = data => { res.status(200).json({ success: true, data: data }) };
  const failure = err => { res.status(500).json({ success: false, data: err }) };

  let data = null;
  getRequest()
    .then(getAllUserName)
    .then(requests => {
      data = { requests: requests };
      return getTotalCount();
    })
    .then(total => {
      data = { ...data, total: total };
      return data;
    })
    .then(success)
    .catch(failure);
};



// Get Maker Request
exports.GetMyMakerRequest = (req, res, next) => {
  const id = req.params.id;
  const type = req.params.type;
  const page = req.params.page;

  const getRequest = () => {
    return new Promise((resolve, reject) => {
      const sql =
        `SELECT * FROM market.request Q
      WHERE group_id IN
        (SELECT DISTINCT group_id FROM market.request Q 
              WHERE(client_id = ${ id} OR expert_id = ${id}) AND Q.type LIKE 'maker' AND Q.status NOT LIKE 'normal')
      LIMIT ${ page * 10}, 10`
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          reject(err);
        }
      });
    });
  };
  const getUserName = request => {
    return new Promise((resolve, reject) => {
      const sql =
        (request.sort_in_group === 0)
          ? `SELECT nick_name FROM market.user WHERE uid = ${request.client_id} `
          : `SELECT nick_name FROM market.user WHERE uid = ${request.expert_id} `;
      // console.log(sql);
      connection.query(sql, (err, row) => {
        if (!err && row) {
          resolve(row[0]["nick_name"]);
        }
        else
          reject(err);
      });
    });
  };
  const getAllUserName = requests => {
    return new Promise((resolve, reject) => {
      Promise.all(
        requests.map(async item => {
          item.nick_name = await getUserName(item);
          return item;
        }))
        .then(list => {
          resolve(list)
        })
        .catch(err => reject(err))
    })
  }
  const getTotalCount = () => {
    return new Promise((resolve, reject) => {
      const sql =
        `SELECT COUNT(*) AS 'total' FROM market.request Q
      WHERE Q.type = "${type}" AND Q.completed NOT LIKE 1`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row[0]["total"]);
        } else {
          reject(err);
        }
      });
    });
  };

  const success = data => { res.status(200).json({ success: true, data: data }) };
  const failure = err => { res.status(500).json({ success: false, data: err }) };

  let data = null;
  getRequest()
    .then(getAllUserName)
    .then(requests => {
      data = { requests: requests };
      return getTotalCount();
    })
    .then(total => {
      data = { ...data, total: total };
      return data;
    })
    .then(success)
    .catch(failure);
};


exports.UpdateRequest = (req, res, next) => {
  const uid = req.params.id;

}

//Create Request
exports.UpdateRequest = (req, res, next) => {
  let data = { ...req.body };
  const uid = req.params.id;
  const update_sort = () => {
    // 1.UPDATE BOARD SET SORTS = SORTS + 1 
    // WHERE BGROUP =  (원글의 BGROUP)  AND SORTS >(원글의 SORTS)
    return new Promise((resolve, reject) => {
      if (data.group_id == null) resolve(id);
      const sql = `UPDATE market.request SET sort_in_group = sort_in_group + 1
      WHERE group_id = ${ data.group_id} AND sort_in_group > ${data.sort_in_group} `;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  }
  const answer = id => {
    // 2. INSERT INTO BOARD VALUES (번호, (원글의 BGROUP), (원글의 SORTS +1), (원글의 DEPTH +1) ,' 제목')
    return new Promise((resolve, reject) => {
      if (data.expert_id !== "null" && data.expert_id) {
        data.expert_id = parseInt(data.expert_id, 10);
      } else {
        delete data.expert_id;
      }
      if (data.personal !== "null" && data.personal) {
        data.personal = parseInt(data.personal, 10);
      } else {
        delete data.personal;
      }
      const obj = { ...data, group_id: data.group_id, sort_in_group: data.sort_in_group + 1, expert_id: id };
      const sql = `UPDATE market.request SET ? WHERE uid=${uid}`;
      connection.query(sql, obj, (err, row) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  };
  const update_request = (id) => {
    return new Promise((resolve, reject) => {
      // console.log("create_request:", data);
      if (data.expert_id !== "null" && data.expert_id) {
        data.expert_id = parseInt(data.expert_id, 10);
      } else {
        delete data.expert_id;
      }
      if (data.personal !== "null" && data.personal) {
        data.personal = parseInt(data.personal, 10);
      } else {
        delete data.personal;
      }

      const obj = { ...data, sort_in_group: 0, client_id: id };
      const sql = `UPDATE market.request SET ? WHERE uid=${uid}`;
      // console.log(sql, obj);
      connection.query(sql, obj, (err, row) => {
        if (!err) {
          resolve(row.insertId);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };
  const give_group_id = id => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE market.request SET group_id = ${id} WHERE uid = ${id} `;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  };
  const respond = () => { res.status(200).json({ success: true, id: data.personal || null, message: "글 작성을 완료하였습니다." }) };
  const error = () => { res.status(500).json({ message: "so what?" }) };

  // request
  if (!data.group_id) {
    update_request(req.decoded.uid)
      .then(give_group_id)
      .then(respond)
      .catch(error);
  } else {
    update_sort()
      .then(answer(req.decoded.uid))
      .then(respond)
      .catch(error);
  }
};

exports.deleteRequest = (req, res, next) => {
  const id = req.params.id;
  // 그룹 테이블에서 삭제
  const deleteRequest = (id) => {
    //console.log("deleteGroup");
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM market.request WHERE uid = ${id}`, (err, row) => {
        if (!err) {
          resolve(id);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };
  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };


  deleteRequest(id)
    .then(success)
    .catch(fail);
}