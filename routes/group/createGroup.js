var connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");

exports.createGroup = (req, res, next) => {
  req.body["user_id"] = req.decoded.uid;
  let groupId = null;


  const insertDetailDB = (data) => {
    console.log(req.body,data);
    const dbData = {
      user_id:req.body.user_id,
      title:req.body.title,
      description:req.body.description,
      thumbnail_id:data.thumbnail_id,
    }
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO market.gallery SET ?", dbData, (err, rows) => {
        if (!err) {
          //console.log("detail: ", rows);
          groupId = rows.insertId;
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };
  const insertGalleryItem = (data)=>{
    // const dbData = {
    //   gallery_id:data.insertId,
    //   item_id:
    // }
    console.log("insertGalleryItem");
    return new Promise((resolve, reject) => {
      let arr = req.body.itemList.map(item => {
        return new Promise(async (resolve, reject) => {
          connection.query("INSERT INTO market.gallery_item SET ?", {gallery_id:data.insertId,item_id:item.value}, async (err, rows) => {
            if (!err) {
              resolve(rows.insertId);
            } else {
              console.error("MySQL Error:", err);
              reject(err);
            }
          });
        });
      })
      Promise.all(arr).then(resolve(true))
      .catch(error=>
        reject(error)
      )
    });
  };


  const respond = (data) => {
    console.log("respond", data);
    res.status(200).json({
      message: "성공적으로 등록되었습니다.",
      success: true,
      id: data
    });
  };

  createThumbnails({...req.file})
  .then((data)=>insertDetailDB({thumbnail_id:data}))
  .then(insertGalleryItem)
  .then(respond)
  .catch(next);
};


exports.getAllHaveInItem = (req, res, next) => {

  // console.log(req.body.user_id,req.params.id);
  const id = req.params.id;

  const getHaveAllItem = (data) => {
    // console.log(data);
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM market.item WHERE user_id=${id}`, (err, rows) => {
        if (!err) {
          // console.log("detail: ", rows);
          groupId = rows.insertId;
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };
  const respond = data => {
    res.status(200).json({ data });
  };

  getHaveAllItem({...req.body})
    .then(respond)
    .catch(next);
};

