var connection = require("../../configs/connection");

exports.galleryDetail = (req, res, next) => {
    const id = req.params.id;
    console.log(req.params.id);
    // 그룹 정보 가져오기 (GET)
    function getGroupInfo(id) {
      const p = new Promise((resolve, reject) => {
        connection.query(
            `SELECT G.uid,G.user_id,U.nick_name,G.title,G.description,G.create_time,G.update_time,T.m_img as thumbnail
            FROM market.gallery G
            LEFT JOIN market.thumbnail T ON G.thumbnail_id=T.uid
            LEFT JOIN market.user U ON G.user_id=U.uid
            WHERE G.uid=${id}`
            , (err, row) => {
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
    function getGroupItem(data) {
      const p = new Promise((resolve, reject) => {
        connection.query(
            `SELECT I.uid
            FROM market.gallery_item G 
            LEFT JOIN market.item I ON G.item_id=I.uid
            WHERE G.gallery_id=${data.uid}`
            , (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            let number=0;
            data.itemList = row.map((item,index)=>{
              return({value:item.uid,number:number++})
            });
            resolve(data);
          } else {
            reject(err);
          }
        });
      });
      return p;
    };
    getGroupInfo(id)
      .then(getGroupItem)
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json(err));
  };