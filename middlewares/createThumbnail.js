const connection = require("../configs/connection");
const Thumbnail = require("thumbnail");

const createThumbnail = (req, res, next) => {
  let filename = req.file.filename;
  let thumbnail = new Thumbnail("uploads", "thumbnails");
  const thumbnailSize = [50, 200, 600];
  const thumbnailSizeName = ["s_img", "m_img", "l_img"];
  let thumbnailObj = {
    "user_id": req.decoded.uid,
    "s_img": null,
    "m_img": null,
    "l_img": null
  };

  function createThumbnailForSize (file) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      for (let i = 0; i < 3; i++) {
        arr.push(new Promise((resolve, reject) => {
          thumbnail.ensureThumbnail(file, null, thumbnailSize[i], function (err, filename) {
            if (err) {
              reject(err);
            } else {
              thumbnailObj[thumbnailSizeName[i]] = `http://localhost:3000/thumbnails/${filename}`;
              console.log(thumbnailObj[thumbnailSizeName[i]]);
              resolve(true);
            }
          });
        }));
      }
      Promise.all(arr).then(() => {
        resolve(thumbnailObj);
      });
    });
    return p;
  };

  function insertThumbnail () {
    const p = new Promise((resolve, reject) => {
      connection.query("INSERT INTO thumbnail SET ?", thumbnailObj, (err, rows) => {
        if (!err) {
          resolve(rows.insertId);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  const onError = (error) => {
    res.status(500).json({
      error: error
    });
  };

  createThumbnailForSize(filename)
  .then(insertThumbnail)
  .then((thumbnailId) => {
    req.body.thumbnail = thumbnailId;
    next();
  }).catch(onError);
};

module.exports = createThumbnail;
