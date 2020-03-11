var connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");

exports.updateGroup = (req, res, next) => {
  const id = parseInt(req.params.id,10);
  // console.log(id);
  // return;
  const updateDetailDB = (data) => {
    console.log("updateDetailDB");
    const dbData = req.file?{
      user_id:req.body.user_id,
      title:req.body.title,
      description:req.body.description,
      thumbnail_id:data.thumbnail_id,
    }:{
      user_id:req.body.user_id,
      title:req.body.title,
      description:req.body.description,
    }
    console.log(dbData,id);
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE market.gallery SET ? WHERE uid=${id}`,dbData, (err, rows) => {
        if (!err) {
          console.log("updateDetailDB: ", rows);
          groupId = rows.insertId;
          resolve(rows);
        } else {
          console.log("updateDetailDB: ", err);
          reject(err);
        }
      });
    });
  };
  const deleteGalleryItem = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM market.gallery_item WHERE gallery_id = ${id}`, (err, rows) => {
        if (!err) {
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  const insertGalleryItem = (data)=>{
    console.log("insertGalleryItem");
    return new Promise((resolve, reject) => {
      let arr = req.body.itemList.map(item => {
        return new Promise(async (resolve, reject) => {
          connection.query("INSERT INTO market.gallery_item SET ?", {gallery_id:id,item_id:item.value}, async (err, rows) => {
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
  .then((data)=>updateDetailDB({thumbnail_id:data}))
  .then(deleteGalleryItem)
  .then(insertGalleryItem)
  .then(respond)
  .catch(next);
};

exports.createGroupIssue = (req, res, next) => {
  req.body["group_id"] = req.params.id;
  req.body["user_id"] = req.decoded.uid;

  const createIssue = (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO group_issue SET ?", data, (err, result) => {
        if (!err) {
          //console.log("result", result);
          resolve(result);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  createIssue(req.body)
    .then(success)
    .catch(fail);
};

exports.deleteGroupIssue = (req, res, next) => {
  const groupId = req.params.id;
  const issueId = req.params.issue_id;

  const deleteIssue = (groupId, issueId) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM group_issue WHERE group_id = ${groupId} AND uid = ${issueId}`, (err, result) => {
        if (!err) {
          //console.log("result", result);
          resolve(result);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  deleteIssue(groupId, issueId)
    .then(success)
    .catch(fail);
};
