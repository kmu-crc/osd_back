var connection = require("../../configs/connection");


//---------------------------------------------
// designer
//---------------------------------------------
exports.getLikeDesigner = (req, res, next) => {
  const userId = req.decoded.uid;
  const designerId = req.params.id;
  const designer = "designer";
  // console.log("ID:::::",userId,designerId);

  // designer 좋아요 여부 가져오기
  const getLike = () => {
    // console.log("ID:::::",userId,designerId);
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM market.like WHERE user_id = ${userId} AND to_id = ${designerId} AND type="${designer}"`, (err, result) => {
        if (!err && result.length === 0) {
          //console.log(result);
          res.status(200).json({like: false});
        } else if (!err && result.length > 0) {
          res.status(200).json({like: true});
        } else {
          //console.log(err);
          res.status(500).json({like: false});
        }
      });
    });
  };

  getLike();
};

// exports.getLikeDesignerCount = (req, res, next) => {
//   const userId = req.decoded.uid;
//   const designerId = req.params.id;
//   const designer = "designer";
//   console.log("ID:::::",userId,designerId);

//   // designer 좋아요 여부 가져오기
//   const getCount = () => {
//     console.log("ID:::::",userId,designerId);
//     return new Promise((resolve, reject) => {
//       connection.query(`SELECT count(*) FROM market.like WHERE user_id=${userId} AND type="${designer}";`, (err, result) => {
//         if (!err && result.length === 0) {
//           //console.log(result);
//           res.status(200).json({like: false});
//         } else if (!err && result.length > 0) {
//           res.status(200).json({like: true});
//         } else {
//           //console.log(err);
//           res.status(500).json({like: false});
//         }
//       });
//     });
//   };

//   getCount();
// };

exports.likeDesigner = (req, res, next) => {
  const { NewAlarm } = require("../../socket");

  const userId = req.decoded.uid;
  const designerId = req.params.id;

  // user(designer)_like 테이블 업데이트
  const updateDesignerLike = () => {
    const data = {
      type:"designer",
      user_id:userId,
      to_id:designerId
    }
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO market.like SET ? ", data, (err, row) => {
        if (!err) {
          resolve(designerId);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  // user_counter 테이블 업데이트
  // const updateDesignerCount = () => {
  //   return new Promise((resolve, reject) => {
  //     connection.query(`UPDATE user_counter SET total_like = total_like + 1 WHERE user_id = ${designerId}`, (err, row) => {
  //       if (!err) {
  //         res.status(200).json({success: true, designer_id: designerId});
  //       } else {
  //         //console.log(err);
  //         res.status(500).json({success: false, designer_id: designerId});
  //       }
  //     });
  //   });
  // };

  updateDesignerLike()
  .then(NewAlarm({ type: "ITEM_LIKE_TO_DESIGNER", from: userId, to: designerId, })) // 
    // .then(updateDesignerCount);
};

exports.unlikeDesigner = (req, res, next) => {
  const userId = req.decoded.uid;
  const designerId = req.params.id;
  const designer="designer";

  // user(designer)_like 테이블 업데이트
  const deleteDesignerLike = () => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM market.like WHERE user_id = ${userId} AND to_id = ${designerId} AND type="${designer}"`, (err, row) => {
        if (!err) {
          resolve(designerId);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  // user_counter 테이블 업데이트
  // const updateDesignerCount = () => {
  //   return new Promise((resolve, reject) => {
  //     connection.query(`UPDATE user_counter SET total_like = total_like - 1 WHERE user_id = ${designerId}`, (err, row) => {
  //       if (!err) {
  //         res.status(200).json({success: true, designer_id: designerId});
  //       } else {
  //         //console.log(err);
  //         res.status(500).json({success: false, designer_id: designerId});
  //       }
  //     });
  //   });
  // };

  deleteDesignerLike();
    // .then(updateDesignerCount);
};


exports.likeInDesigner=(req,res,next)=>{
  const id = req.params.id
  const page = req.params.page
  let sql =`
  SELECT E.uid, E.user_id,U.nick_name, E.thumbnail_id,E.category_level1, E.category_level2,T.m_img  FROM market.like L
  JOIN market.expert E ON E.user_id = L.to_id 
  LEFT JOIN market.thumbnail T ON T.uid = E.thumbnail_id
  LEFT JOIN market.user U ON U.uid = E.user_id
  WHERE L.user_id = ${id} AND L.type="designer" AND E.type="designer"
  LIMIT ` + (page * 10) + `, 10`;
  req.sql = sql;
  next();
}


//---------------------------------------------
// maker
//---------------------------------------------
exports.getLikeMaker = (req, res, next) => {
  const userId = req.decoded.uid;
  const makerId = req.params.id;
  const maker="maker";

  // Maker 좋아요 여부 가져오기
  const getLike = () => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM market.like WHERE user_id = ${userId} AND to_id = ${makerId} AND type="${maker}"`, (err, result) => {
        if (!err && result.length === 0) {
          //console.log(result);
          res.status(200).json({like: false});
        } else if (!err && result.length > 0) {
          res.status(200).json({like: true});
        } else {
          //console.log(err);
          res.status(500).json({like: false});
        }
      });
    });
  };

  getLike();
};

exports.likeMaker = (req, res, next) => {
  const { NewAlarm } = require("../../socket");

  const userId = req.decoded.uid;
  const makerId = req.params.id;

  // user(Maker)_like 테이블 업데이트
  const updateMakerLike = () => {
    const data = {
      type:"maker",
      user_id:userId,
      to_id:makerId
    }
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO market.like SET ? ", data, (err, row) => {
        if (!err) {
          resolve(makerId);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  // user_counter 테이블 업데이트
  // const updateDesignerCount = () => {
  //   return new Promise((resolve, reject) => {
  //     connection.query(`UPDATE user_counter SET total_like = total_like + 1 WHERE user_id = ${designerId}`, (err, row) => {
  //       if (!err) {
  //         res.status(200).json({success: true, designer_id: designerId});
  //       } else {
  //         //console.log(err);
  //         res.status(500).json({success: false, designer_id: designerId});
  //       }
  //     });
  //   });
  // };

  updateMakerLike()
  .then(NewAlarm({ type: "ITEM_LIKE_TO_MAKER", from: userId, to: makerId, })) // 

    // .then(updateDesignerCount);
};

exports.unlikeMaker = (req, res, next) => {
  const userId = req.decoded.uid;
  const makerId = req.params.id;
  const maker="maker";

  // user(designer)_like 테이블 업데이트
  const deleteMakerLike = () => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM market.like WHERE user_id = ${userId} AND to_id = ${makerId} AND type="${maker}"`, (err, row) => {
        if (!err) {
          resolve(makerId);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  // user_counter 테이블 업데이트
  // const updateDesignerCount = () => {
  //   return new Promise((resolve, reject) => {
  //     connection.query(`UPDATE user_counter SET total_like = total_like - 1 WHERE user_id = ${designerId}`, (err, row) => {
  //       if (!err) {
  //         res.status(200).json({success: true, designer_id: designerId});
  //       } else {
  //         //console.log(err);
  //         res.status(500).json({success: false, designer_id: designerId});
  //       }
  //     });
  //   });
  // };

  deleteMakerLike();
    // .then(updateDesignerCount);
};

exports.likeInMaker=(req,res,next)=>{
  const id = req.params.id
  const page = req.params.page
  console.log("ID:::::",id);
  let sql =`
  SELECT E.uid, E.user_id,U.nick_name, E.thumbnail_id,E.category_level1, E.category_level2,T.m_img  FROM market.like L
  JOIN market.expert E ON E.user_id = L.to_id 
  LEFT JOIN market.thumbnail T ON T.uid = E.thumbnail_id
  LEFT JOIN market.user U ON U.uid = E.user_id
  WHERE L.user_id = ${id} AND L.type="maker" AND E.type="maker"
  LIMIT ` + (page * 10) + `, 10`;
  req.sql = sql;
  next();
}

