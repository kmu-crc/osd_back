const jwt = require("jsonwebtoken");
const connection = require("../configs/connection");

const tokenDecoded = (req, res, next) => {
  // read the token from header or url
  const token = req.headers["x-access-token"] || req.query.token;
  // token does not exist
  if (!token) {
    req.decoded = null;
    return next();
  }

  // create a promise that decodes the token
  const p = new Promise(
    (resolve, reject) => {
      jwt.verify(token, req.app.get("jwt-secret"), (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    }
  );

  const getThumbnail = decoded => {
    return new Promise(
      (resolve, reject) => {
        connection.query(`SELECT * FROM thumbnail WHERE user_id=${decoded.uid}`, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            decoded.thumbnail = rows[0];
            resolve(decoded);
          }
        });
      }
    );
  };

  // if it has failed to verify, it will return an error message
  const onError = (error) => {
    res.status(403).json({
      success: false,
      message: error.message
    });
  };

  // process the promise
  p.then(getThumbnail)
    .then((decoded) => {
      req.decoded = decoded;
      next();
    }).catch(onError);
};

module.exports = tokenDecoded;
