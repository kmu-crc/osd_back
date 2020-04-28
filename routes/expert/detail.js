var connection = require("../../configs/connection");

exports.designerDetail = (req, res, next) => {
  let result = {};
  const id = req.params.id;
  const designer="designer";
  // 디자이너 정보 가져오기 (GET)
  function getDesignerInfo() {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT E.uid, E.user_id, E.description, E.location, E.category_level1, E.category_level2, 
                        E.tag, E.experience, E.score FROM market.expert E
                        WHERE E.type="${designer}" AND E.user_id = ${id}`, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          result = {...result,...data};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };
  // 디자이너 프로필 썸네일 가져오기
  function getThumbnail(data) {
    return new Promise ((resolve, reject)=>{
      const sql = `SELECT m_img FROM market.thumbnail WHERE uid in (SELECT thumbnail_id FROM market.expert WHERE user_id = ${id} AND type="${designer}")`;
      // console.log(sql);
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0].m_img;
          console.log("row[0]",row[0].m_img);
          result= {image:data};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  }
  const respond = data => {
    res.status(200).json(result)
  };

  const error = err => {
    console.log(err); res.status(500).json(err);
  };
    getThumbnail(id)
    .then(getDesignerInfo)
    .then(respond)
    .catch(error);
};
exports.makerDetail = (req, res, next) => {
  let result = {};
  const id = req.params.id;
  const maker="maker";
  // 디자이너 정보 가져오기 (GET)
  console.log("id======");
  function getMakerInfo() {
    const p = new Promise((resolve, reject) => {
      console.log("query play");
      connection.query(`SELECT E.uid, E.user_id, E.description, E.location, E.category_level1, E.category_level2, 
                        E.tag, E.experience, E.maker_equipment, E.maker_technique, E.score FROM market.expert E
                        WHERE E.type="${maker}" AND E.user_id = ${id}`, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          result = {...result,...data};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };
  // 디자이너 프로필 썸네일 가져오기
  function getThumbnail(data) {
    return new Promise ((resolve, reject)=>{
      const sql = `SELECT m_img FROM market.thumbnail WHERE uid in (SELECT thumbnail_id FROM market.expert WHERE user_id = ${id} AND type="${maker}")`;
      // console.log(sql);
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0].m_img;
          console.log("row[0]",row[0].m_img);
          result= {image:data};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  }
  const respond = data => {
    res.status(200).json(result)
  };

  const error = err => {
    console.log(err); res.status(500).json(err);
  };
    getThumbnail(id)
    .then(getMakerInfo)
    .then(respond)
    .catch(error);
};


exports.designerViewDetail = (req, res, next) => {
  console.log("designerViewDetail");
  let result = {};
  const id = req.params.id;
  const designer="designer";
  // 디자이너 정보 가져오기 (GET)
  function getUserInfo(){
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT U.email, U.nick_name FROM market.user U
                        WHERE U.uid = ${id}`, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          result = {...result,...data};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }
  function getDesignerInfo() {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT E.uid, E.user_id, E.description, E.location, E.category_level1, E.category_level2, 
      E.tag, E.experience, E.score FROM market.expert E
      WHERE E.type="${designer}" AND E.user_id = ${id}`, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          result = {...result,...data};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };
  // 디자이너 프로필 썸네일 가져오기
  function getThumbnail(data) {
    return new Promise ((resolve, reject)=>{
      const sql = `SELECT m_img FROM market.thumbnail WHERE uid in (SELECT thumbnail_id FROM market.expert WHERE user_id = ${id} AND type="${designer}")`;
      // console.log(sql);
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0].m_img;
          console.log("row[0]",row[0].m_img);
          result= {image:data};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  }
  const getLikeCount = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT count(*) as "likeCount" FROM market.like WHERE to_id=${id} AND type="${designer}";`, (err, row) => {
        if (!err) {
          // console.log("getCount == ",result[0]);
          let rowData = row[0];
          result = {...result,...rowData};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
};
const getItemCount = (data) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT count(*) as "itemCount" FROM market.item WHERE user_id=${id};`, (err, row) => {
      if (!err) {
        let rowData = row[0];
        result = {...result,...rowData};
                resolve(data);
      } else {
        reject(err);
      }
    });
  });
};

  const respond = data => {
    res.status(200).json(result)
  };

  const error = err => {
    console.log(err); res.status(500).json(err);
  };
    getThumbnail(id)
    .then(getUserInfo)
    .then(getDesignerInfo)
    .then(getItemCount)
    .then(getLikeCount)
    .then(respond)
    .catch(error);
};

exports.makerViewDetail = (req, res, next) => {
  let result = {};
  const id = req.params.id;
  const maker="maker";
  // 디자이너 정보 가져오기 (GET)
  console.log("id======");
  function getUserInfo(){
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT U.email, U.nick_name FROM market.user U
                        WHERE U.uid = ${id}`, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          result = {...result,...data};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }
  function getMakerInfo() {
    const p = new Promise((resolve, reject) => {
      console.log("query play");
      connection.query(`SELECT E.uid, E.user_id, E.description, E.location, E.category_level1, E.category_level2, 
                        E.tag, E.experience, E.maker_equipment, E.maker_technique, E.score FROM market.expert E
                        WHERE E.type="${maker}" AND E.user_id = ${id}`, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          result = {...result,...data};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };
  // 디자이너 프로필 썸네일 가져오기
  function getThumbnail(data) {
    return new Promise ((resolve, reject)=>{
      const sql = `SELECT m_img FROM market.thumbnail WHERE uid in (SELECT thumbnail_id FROM market.expert WHERE user_id = ${id} AND type="${maker}")`;
      // console.log(sql);
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0].m_img;
          console.log("row[0]",row[0].m_img);
          result= {image:data};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  }

const getLikeCount = (data) => {
    const maker = "maker";
    return new Promise((resolve, reject) => {
      connection.query(`SELECT count(*) as "likeCount" FROM market.like WHERE to_id=${id} AND type="${maker}";`, (err, row) => {
        if (!err) {
          // console.log("getCount == ",result[0]);
          let rowData = row[0];
          result = {...result,...rowData};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
};
const getItemCount = (data) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT count(*) as "itemCount" FROM market.item WHERE user_id=${id};`, (err, row) => {
      if (!err) {
        let rowData = row[0];
        result = {...result,...rowData};
                resolve(data);
      } else {
        reject(err);
      }
    });
  });
};

  const respond = data => {
    res.status(200).json(result)
  };

  const error = err => {
    console.log(err); res.status(500).json(err);
  };
    getThumbnail(id)
    .then(getUserInfo)
    .then(getMakerInfo)
    .then(getItemCount)
    .then(getLikeCount)
    .then(respond)
    .catch(error);
};

