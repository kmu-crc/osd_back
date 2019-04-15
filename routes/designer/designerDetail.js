var connection = require("../../configs/connection");

exports.designerDetail = (req, res, next) => {
  const id = req.params.id;

  // 디자이너 정보 가져오기 (GET)
  function getDesignerInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT U.uid, U.nick_name, U.thumbnail, D.category_level1, D.category_level2, D.about_me FROM user U LEFT JOIN user_detail D ON U.uid = D.user_id WHERE U.uid = ?", id, (err, row) => {
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

  // 디자이너 프로필 썸네일 가져오기
  function getMyThumbnail (data) {
    const p = new Promise((resolve, reject) => {
      if (!data.thumbnail) {
        data.thumbnailUrl = null;
        resolve(data);
      } else {
        connection.query("SELECT s_img, m_img, l_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
          if (!err && row.length === 0) {
            data.thumbnailUrl = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.thumbnailUrl = row[0];
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

  getDesignerInfo(id)
    .then(getMyThumbnail)
    .then(getCategory)
    .then(result => res.status(200).json(result))
    .catch(err => { console.log(err); res.status(500).json(err); });
};

exports.getCount = (req, res, next) => {
  const designerId = req.params.id;

  // 디자이너 count 정보 가져오기 (GET)
  function getDesignerCount (data) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT total_like, total_design, total_group, total_view FROM user_counter WHERE user_id = ?", designerId, (err, row) => {
        if (!err) {
          //console.log(row[0]);
          res.status(200).json(row[0]);
        } else {
          //console.log(err);
          res.status(500).json(err);
        }
      });
    });
    return p;
  };

  getDesignerCount(designerId);
};


exports.getDesignerCounts = (req, res, next) => {
  const designer_id = req.params.id
  let Row = {}

  function getDesignerDetail(id){
    return new Promise((resolve, reject) => {
      conection.query("SELECT COUNT(*) AS total_like FROM opendesign.design_like WHERE user_id=?", id, (err, row)=>{
        if(!err){
          Row.push({total_like: row[0]})
        } else {
          Row.push({total_like: 0})
        }
      })
      connection.query("SELECT COUNT(*) AS total_group FROM opendesign.group WHERE user_id=?", id, (err, row)=>{
        if(!err){
          Row.push({total_group: row[0]})
        } else {
          Row.push({total_group: 0})
        }
      })
      connection.query("SELECT COUNT(*) AS total_design FROM opendesign.group WHERE user_id=?", id, (err, row)=>{
        if(!err){
          Row.push({total_design: row[0]})
        } else {
          Row.push({total_design: 0})
        }
      })
      connection.query("SELECT total_view FROM opendesign.user_counter WHERE user_id=?", id, (err, row)=>{
        if(!err){
          Row.push({total_view: row[0]})
        } else {
          Row.push({total_view: 0})
        }
      })
      resolve(Row)
    })
  }

  const respond = (row) => {
    res.status(200).json({success:true, row:row})
  }
  const error = () => {
    console.log("INTERAL_ERR: Failed Get designer info")
    res.status(500).json("internal error")
  }

  getDesignerDetail(designer_id)
    .then(data=>respond(data))
    .catch(error)
}