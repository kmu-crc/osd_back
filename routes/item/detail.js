var connection = require("../../configs/connection");

exports.itemDetail = (req, res, next) => {
  console.log("designDetail");
  const designId = req.params.id;
  let loginId;
  if (req.decoded !== null) {
    loginId = req.decoded.uid;
  } else {
    loginId = null;
  }

  // 디자인 기본 정보 가져오기
  function getDesignInfo(id) {
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
  }

  // 등록자 닉네임 가져오기
  function getName(data) {
    const p = new Promise((resolve, reject) => {
      if (data.user_id === null) {
        data.userName = null;
        resolve(data);
      } else {
        connection.query(
          "SELECT nick_name FROM user WHERE uid = ?",
          data.user_id,
          (err, result) => {
            if (!err) {
              data.userName = result[0].nick_name;
              resolve(data);
            } else {
              reject(err);
            }
          }
        );
      }
    });
    return p;
  }

  // 카테고리 이름 가져오기
  function getCategory(data) {
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
  }

  // 디자인 썸네일 가져오기 (GET)
  function getThumnbail(data) {
    const p = new Promise((resolve, reject) => {
      if (data.thumbnail === null) {
        data.img = null;
        resolve(data);
      } else {
        const sql = `SELECT s_img, m_img, l_img FROM thumbnail WHERE uid = ${data.thumbnail}`;
        connection.query(sql, (err, row) => {
          if (!err && row.length === 0) {
            data.img = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.img = [row[0]];
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
    return p;
  }

  // 속한 멤버들의 id, 닉네임 리스트 가져오기
  function getMemberList(data) {
    const p = new Promise((resolve, reject) => {
      connection.query(
        "SELECT D.user_id, U.nick_name FROM design_member D JOIN user U ON U.uid = D.user_id WHERE D.design_id = ? AND D.is_join = 1",
        data.uid,
        (err, row) => {
          if (!err && row.length === 0) {
            data.member = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.member = row;
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
    return p;
  }

  // 파생된 디자인 수 가져오기
  function getChildrenCount(data) {
    const p = new Promise((resolve, reject) => {
      connection.query(
        "SELECT count(*) FROM design WHERE parent_design = ?",
        data.uid,
        (err, result) => {
          if (!err) {
            data.children_count = result[0];
            //console.log(data);
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
    return p;
  }

  // 내가 디자인 멤버인지 검증하기
  function isTeam(data) {
    const p = new Promise((resolve, reject) => {
      if (loginId === null) {
        data.is_team = 0;
        resolve(data);
      } else {
        connection.query(
          `SELECT * FROM design_member WHERE design_id = ${
          data.uid
          } AND user_id = ${loginId} AND is_join = 1`,
          (err, result) => {
            if (!err && result.length === 0) {
              data.is_team = 0;
              resolve(data);
            } else if (!err && result.length > 0) {
              data.is_team = 1;
              resolve(data);
            } else {
              //console.log(err);
              reject(err);
            }
          }
        );
      }
    });
    return p;
  }

  // 내가 가입 신청중인 디자인인지 검증하기
  function waiting(data) {
    const p = new Promise((resolve, reject) => {
      if (loginId === null) {
        data.waitingStatus = 0;
        resolve(data);
      } else {
        connection.query(
          `SELECT * FROM design_member WHERE design_id = ${
          data.uid
          } AND user_id = ${loginId} AND is_join = 0`,
          (err, result) => {
            if (!err && result.length === 0) {
              data.waitingStatus = 0;
              resolve(data);
            } else if (!err && result.length > 0) {
              data.waitingStatus = 1;
              resolve(data);
            } else {
              //console.log(err);
              reject(err);
            }
          }
        );
      }
    });
    return p;
  }

  // 맴버 섬네일 가져오기
  const getThumbnailId = id => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT thumbnail FROM user WHERE uid = ${id}`,
        (err, result) => {
          if (!err) {
            //console.log("member: ", result[0]);
            resolve(result[0].thumbnail);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  const getThumbnail = id => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM thumbnail WHERE uid = ${id}`,
        (err, result) => {
          if (!err) {
            //console.log("member: ", result[0]);
            resolve(result[0]);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  const memberLoop = list => {
    return new Promise(async (resolve, reject) => {
      let newList = [];
      if (!list || list.length === 0) {
        resolve(null);
      } else {
        for (let item of list) {
          try {
            let thumbnail = await getThumbnailId(item.user_id);
            if (thumbnail) {
              item.thumbnail = await getThumbnail(thumbnail);
            } else {
              item.thumbnail = null;
            }
            newList.push(item);
          } catch (err) {
            newList.push(err);
          }
        }
        Promise.all(newList)
          .then(data => {
            //console.log("members", data);
            return resolve(data);
          })
          .catch(err => reject(err));
      }
    });
  };

  // 맴버 가져오기
  const getMembers = (data, designId) => {
    return new Promise(async (resolve, reject) => {
      try {
        data.member = await memberLoop(data.member);
        //console.log("dddddata", data);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  };

  // GET PRICE OF DESIGN
  const getPrice = (data) => {
    return new Promise((resolve, reject) => {
      const _sql = `SELECT price FROM opendesign.price WHERE item_id = ${data.uid};`;
      connection.query(_sql, (err, row) => {
        if (!err) {
          if (row.length) {
            data.price = row[0].price;
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  // GET REVIEWS OF DESIGN
  const getReview = (data) => {
    return new Promise((resolve, reject) => {
      const _sql = `
SELECT T.m_img AS 'img', UT.m_img AS 'who', U.nick_name AS 'user_id', R.comment, R.order_id FROM opendesign.review R
LEFT JOIN opendesign.user U ON U.uid = R.user_id
LEFT JOIN opendesign.thumbnail T ON T.uid IN (SELECT thumbnail FROM opendesign.design WHERE uid=R.product_id)
LEFT JOIN opendesign.thumbnail UT ON UT.uid IN (SELECT thumbnail FROM opendesign.user WHERE uid=U.uid)
WHERE R.product_id IN (SELECT uid FROM opendesign.design WHERE user_id=${data.user_id});`;
      // SELECT 
      // U.nick_name AS 'user_id', R.comment, R.order_id FROM opendesign.review R
      // LEFT JOIN opendesign.user U ON U.uid = R.user_id WHERE R.product_id=${data.user_id}`;
      connection.query(_sql, (err, row) => {
        if (!err) {
          if (row.length) {
            data.reviews = row;
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  // GET DELIVERY OF DESIGN
  const getDelivery = (data) => {
    return new Promise((resolve, reject) => {
      const _sql = `
SELECT delivery_cost AS 'cost', delivery_days AS 'days', delivery_company AS 'company' \
FROM opendesign.product_delivery \
WHERE product_id = ${data.uid};`;
      connection.query(_sql, (err, row) => {
        if (!err) {
          if (row.length) {
            data.delivery = row[0];
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  getDesignInfo(designId)
    .then(getName)
    .then(getCategory)
    .then(getThumnbail)
    .then(getMemberList)
    .then(getChildrenCount)
    .then(isTeam)
    .then(waiting)
    .then(getPrice)
    .then(getDelivery)
    .then(getReview)
    .then(data => getMembers(data, designId))
    .then(data => res.status(200).json(data))
    .catch(err => res.status(200).json(err));
};

