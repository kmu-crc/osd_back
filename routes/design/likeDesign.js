var connection = require("../../configs/connection");

exports.getLikeDesign = (req, res, next) => {
  const userId = req.decoded.uid;
  const designId = req.params.id;

  // Design 좋아요 여부 가져오기
  const getLike = () => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM design_like WHERE user_id = ${userId} AND design_id = ${designId}`, (err, result) => {
        if (!err && result.length === 0) {
          // console.log(result);
          res.status(200).json({like: false});
        } else if (!err && result.length > 0) {
          res.status(200).json({like: true});
        } else {
          console.log(err);
          res.status(500).json({like: false});
        }
      });
    });
  };

  getLike();
};

exports.likeDesign = (req, res, next) => {
  const userId = req.decoded.uid;
  const designId = req.params.id;

  // design_like 테이블 업데이트
  const updateDesignLike = () => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO design_like SET ? ", {user_id: userId, design_id: designId}, (err, row) => {
        if (!err) {
          resolve(designId);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  // design_counter 테이블 업데이트
  const updateDesignCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design_counter SET like_count = like_count + 1 WHERE design_id = ${designId}`, (err, row) => {
        if (!err) {
          res.status(200).json({success: true, design_id: designId});
        } else {
          console.log(err);
          res.status(500).json({success: false, design_id: designId});
        }
      });
    });
  };

  updateDesignLike()
    .then(updateDesignCount);
};

exports.unlikeDesign = (req, res, next) => {
  const userId = req.decoded.uid;
  const designId = req.params.id;

  // design_like 테이블 업데이트
  const deleteDesignLike = () => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM design_like WHERE user_id = ${userId} AND design_id = ${designId}`, (err, row) => {
        if (!err) {
          resolve(designId);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  // design_counter 테이블 업데이트
  const updateDesignCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design_counter SET like_count = like_count - 1 WHERE design_id = ${designId}`, (err, row) => {
        if (!err) {
          res.status(200).json({success: true, design_id: designId});
        } else {
          console.log(err);
          res.status(500).json({success: false, design_id: designId});
        }
      });
    });
  };

  deleteDesignLike()
    .then(updateDesignCount);
};
