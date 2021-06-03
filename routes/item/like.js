var connection = require("../../configs/connection");



exports.getLikeItem = (req, res, next) => {
  console.log("getLikeItem");
    const userId = req.decoded.uid;
    const itemId = req.params.id;
    const item = "item";
  
    // Design 좋아요 여부 가져오기
    const getLike = () => {
      return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM market.like WHERE user_id = ${userId} AND to_id = ${itemId} AND type="${item}"`, (err, result) => {
          console.log("getLike",result);
            if (!err && result.length === 0) {
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

exports.likeItem = (req, res, next) => {

  const { NewAlarm } = require("../../socket");

    const userId = req.decoded.uid;
    const itemId = req.params.id;
  
    // like 테이블 업데이트
    const updateItemLike = () => {
      const data = {
          type:"item",
          user_id:userId,
          to_id:itemId
      }
      return new Promise((resolve, reject) => {
        connection.query("INSERT INTO market.like SET ? ", data, (err, row) => {
          if (!err) {
            resolve(itemId);
          } else {
            console.log(err);
            reject(err);
          }
        });
      });
    };
    const getOwner = () => {
      return new Promise((resolve, reject) => {
          const sql = `SELECT user_id AS owner FROM market.item WHERE uid=${itemId}`;
          connection.query(sql, (err, row) => {
              if (!err) {
                  resolve(row[0]);
              } else {
                  reject(err);
              }
          });
      });
  };

    updateItemLike()
    .then(getOwner)
    .then(data=>NewAlarm({ type: "ITEM_LIKE_TO_OWNER", from: userId, to: data.owner,item_id:itemId })) // 

}

exports.unlikeItem = (req, res, next) => {
    const userId = req.decoded.uid;
    const itemId = req.params.id;
    const item = "item";
  
    // like 테이블 업데이트
    const deleteItemLike = () => {
      return new Promise((resolve, reject) => {
        connection.query(`DELETE FROM market.like WHERE user_id = ${userId} AND to_id = ${itemId} AND type="${item}"`, (err, row) => {
          if (!err) {
            resolve(itemId);
          } else {
            console.log(err);
            reject(err);
          }
        });
      });
    };
  
    deleteItemLike();
  };

  exports.likeInItem=(req,res,next)=>{
    const id = req.params.id
    const page = req.params.page
    let sql =`
    SELECT I.uid, U.nick_name, I.thumbnail_id, I.user_id, I.title,I.category_level1, I.category_level2,
    I.create_time, I.update_time ,T.m_img,D.type FROM market.item I
    JOIN market.like L ON I.uid = L.to_id
    LEFT JOIN market.thumbnail T ON T.uid = I.thumbnail_id
    LEFT JOIN market.user U ON U.uid = I.user_id
    LEFT JOIN market.item_detail D ON I.uid=D.item_id
    WHERE L.user_id=${id} AND L.type="item" 
ORDER BY I.create_time DESC
    LIMIT ` + (page * 6) + `, 6`;
    req.sql = sql;
    next();
  }
