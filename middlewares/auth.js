const jwt = require("jsonwebtoken");
const connection = require("../configs/connection");

const authMiddleware = (req, res, next) => {
  // read the token from header or url
  const token = req.headers["x-access-token"] || req.query.token;

  // token does not exist
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "not logged in"
    });
  }

  // create a promise that decodes the token
  const p = new Promise((resolve, reject) => {
      jwt.verify(token, req.app.get("jwt-secret"), (err, decoded) => {

			// check expired
			//const now = (new Date().getTime()) / 1000;
			//if(decoded.exp < now ) {
			//	reject(new Error("expired token"));
			//} else {
        if (err) {
					reject(err);
				} else {
        	resolve({...decoded});//, remain:decoded.exp-now});
				}
			//}
      });
    }
  );

  // if it has failed to verify, it will return an error message
  const onError = (error) => {
    res.status(403).json({
      success: false,
      message: error.message
    });
  };

  // process the promise
  p
    // .then(getThumbnail)
    .then((decoded) => {
      req.decoded = decoded;
      next();
    }).catch(onError);
}

module.exports = authMiddleware;
