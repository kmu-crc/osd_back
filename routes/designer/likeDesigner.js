var connection = require("../../configs/connection");

exports.getLikeDesigner = (req, res, next) => {
  const userId = req.decoded.uid;
  const designerId = req.params.id;

  // designer 좋아요 여부 가져오기
  const getLike = () => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM user_like WHERE user_id = ${userId} AND designer_id = ${designerId}`, (err, result) => {
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

exports.likeDesigner = (req, res, next) => {
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

  updateDesignerLike();
    // .then(updateDesignerCount);
};

exports.unlikeDesigner = (req, res, next) => {
  const userId = req.decoded.uid;
  const designerId = req.params.id;

  // user(designer)_like 테이블 업데이트
  const deleteDesignerLike = () => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM market.like WHERE user_id = ${userId} AND to_id = ${designerId}`, (err, row) => {
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
