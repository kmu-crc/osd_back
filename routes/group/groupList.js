const connection = require("../../configs/connection");

exports.groupList = (req,res,next)=>{
  console.log("groupList");
  const id = req.params.id;
  const page =req.params.page;
  const getGroupList = () => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT G.uid,G.thumbnail_id,G.title,G.user_id,U.nick_name,G.description,T.m_img as thumbnail,G.create_time,G.update_time
      FROM market.gallery G 
      LEFT JOIN market.thumbnail T ON G.thumbnail_id = T.uid 
      LEFT JOIN market.user U ON G.user_id = U.uid
      WHERE G.user_id=${id} LIMIT ${page * 10}, 10`, (err, result) => {
        if (!err && result.length>0) {
          console.log("getgrouplist",result[0]);
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  };

  getGroupList()
    .then(num => res.status(200).json(num))
    .catch(err => res.status(500).json(err));
}

exports.getTotalCount = (req, res, next) => {
  const getCount = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT count(*) FROM opendesign.group G", (err, result) => {
        if (!err && result.length) {
          //console.log(result);
          resolve(result[0]);
        } else {
          reject(err);
        }
      });
    });
  };

  getCount()
    .then(num => res.status(200).json(num))
    .catch(err => res.status(500).json(err));
};
