const connection = require("../configs/connection");

exports.updateThumbnailID=(data)=>{
    console.log("updateThumbnailID",data);

    function UpdateUserThumbnailID(data){
      const p = new Promise((resolve, reject) => {
        connection.query(`UPDATE market.user SET thumbnail=${data.thumbnail_id} WHERE uid=${data.user_id}`, (err, rows, fields) => {
          if (!err) {
            console.log("success");
  
            resolve(rows);
          } else {
            console.log("err");
  
            reject(err);
          }
        });
      });
      return p;
    } 

    function UpdateExpertThumbnailID(data){
      const p = new Promise((resolve, reject) => {
        connection.query(`UPDATE market.expert SET thumbnail_id=${data.thumbnail_id} WHERE user_id=${data.user_id}`, (err, rows, fields) => {
          if (!err) {
            console.log("success");
  
            resolve(rows);
          } else {
            console.log("err");
  
            reject(err);
          }
        });
      });
      return p;
    } 

    UpdateUserThumbnailID(data)
    .then(UpdateExpertThumbnailID(data));
  }