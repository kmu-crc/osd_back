const connection = require("../configs/connection");
const { S3Thumbnail } = require("../middlewares/S3Thumbnail");

exports.createThumbnails = (data) => {
  console.log(data);
  return new Promise(async (resolve, reject) => {
    const filename = data.image.filename || data.filename;
    let arr = [];
    if (data == null || !data.image) resolve(null);
    let thumbOBJs = [
      { size: 50, name: "" },
      { size: 200, name: "" },
      { size: 600, name: "" }];

    const resizeThumbnail = (file, size, postfix) => {
      const spawn = require('child_process').spawn;
      return new Promise((resolve, reject) => {
        const newfilename = file.replace(/\.[^.]*$/, '') + postfix;
        const command = `convert uploads/${file} -resize ${size}x${size} thumbnails/${newfilename}`
        var proc = spawn(command, [], { shell: true });
        // console.log("convert ", command);
        proc.on('exit', state_code => {
          if (state_code === 0) {
            resolve(newfilename);
          } else {
            // console.log(state_code);
            reject(false);
          }
        })
      })
    }
    const createThumbnailForSize = (filename) => {
      return new Promise(async (resolve, reject) => {
        for (let obj of thumbOBJs) {
          try {
            const ext = filename.substring(filename.lastIndexOf("."), filename.length);
            obj.name = await resizeThumbnail(filename, obj.size, "x" + obj.size + ext);
          } catch (e) {
            console.log("failed to create thumbnail:", e);
          }
          arr.push(Promise.resolve(obj));
        }
        Promise.all(arr)
          .then(thumbs => {
            resolve({
              user_id: data.uid,
              "s_img": thumbs[0].name, "m_img": thumbs[1].name, "l_img": thumbs[2].name
            });
          })
      })
    }
    const insertThumbnailDB = obj => {
      const newobj = { ...obj, type: data.type }
      return new Promise((resolve, reject) => {
        connection.query("INSERT INTO market.thumbnail SET ?", newobj, (err, rows) => {
          if (!err) {
            resolve(rows.insertId);
          } else {
            reject(err);
          }
        });
      });
    }

    createThumbnailForSize(filename)
      .then(S3Thumbnail)
      .then(insertThumbnailDB)
      .then(thumbnailId => resolve(thumbnailId))
      .catch(error => reject(error));
  });
}
