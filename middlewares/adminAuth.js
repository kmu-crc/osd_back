const adminAuth = (req, res, next) => {
  const isAdmin = () => {
    const p = new Promise((resolve, reject) => {
      //console.log(req.decoded.isAdmin);
      if (req.decoded.isAdmin) {
        resolve(true);
      } else {
        const err = false;
        reject(err);
      }
    });
    return p;
  };

  const onError = () => {
    res.status(403).json({
      success: false,
      message: "관리자가 아닙니다."
    });
  };

  isAdmin()
  .then(() => next())
  .catch(onError);
};

module.exports = adminAuth;
