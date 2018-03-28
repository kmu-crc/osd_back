const stringToNumber = (req, res, next) => {
  const StoN = () => {
    return new Promise((resolve, reject) => {
      for (let key in req.body) {
        if (parseInt(req.body[key])) {
          req.body[key] = parseInt(req.body[key]);
        }
      }
      resolve(true);
    });
  };

  const respon = () => {
    next();
  };

  const onError = (error) => {
    res.status(500).json({
      error: error
    });
  };

  StoN()
  .then(respon)
  .catch(onError);
};

module.exports = stringToNumber;
