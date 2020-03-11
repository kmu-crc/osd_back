const connection = require("../../configs/connection");

exports.galleryList = (req,res,next)=>{
  console.log("groupList");
  const id = req.params.id;
  const page =req.params.page;
  const getGalleryList = () => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT G.uid,G.thumbnail_id,G.title,G.user_id,U.nick_name,G.description,T.m_img as thumbnail,G.create_time,G.update_time
      FROM market.gallery G 
      LEFT JOIN market.thumbnail T ON G.thumbnail_id = T.uid 
      LEFT JOIN market.user U ON G.user_id = U.uid
      WHERE G.user_id=${id} LIMIT ${page * 10}, 10`, (err, result) => {
        if (!err && result.length>0) {
        //   console.log("getgrouplist",result[0]);
          resolve(result);
        } else {
          reject(err);
        }
      });
    });
  };

  getGalleryList()
    .then(num => res.status(200).json(num))
    .catch(err => res.status(500).json(err));
}

exports.galleryItemList = (req, res, next) => {
    const id = req.params.id
    const page = req.params.page
    let sql = `
    SELECT I.uid,I.thumbnail_id,I.user_id,I.title,I.category_level1,I.category_level2,I.create_time,I.update_time,T.m_img as thumbnail
    FROM market.gallery_item G 
    LEFT JOIN market.item I ON G.item_id=I.uid
    LEFT JOIN market.thumbnail T ON I.thumbnail_id=T.uid
    WHERE G.gallery_id=${id}
    LIMIT ` + (page * 10) + `, 10`;
    req.sql = sql;
    next();
  }
// exports.galleryItemList = (req,res,next)=>{
//     console.log("galleryItemList");
//     const id = req.params.id;
//     const page =req.params.page;
//     const getGalleryItemList = () => {
//         console.log(id,page);
//       return new Promise((resolve, reject) => {
//         connection.query(
//           `SELECT G.uid,G.thumbnail_id,G.title,G.user_id,U.nick_name,G.description,T.m_img as thumbnail,G.create_time,G.update_time
//         FROM market.gallery G 
//         LEFT JOIN market.thumbnail T ON G.thumbnail_id = T.uid 
//         LEFT JOIN market.user U ON G.user_id = U.uid
//         WHERE G.user_id=${id} LIMIT ${page * 10}, 10`, (err, result) => {
//           if (!err && result.length>0) {
//           //   console.log("getgrouplist",result[0]);
//             resolve(result);
//           } else {
//             reject(err);
//           }
//         });
//       });
//     };
  
//     getGalleryItemList()
//       .then(num => res.status(200).json(num))
//       .catch(err => res.status(500).json(err));
//   }
  