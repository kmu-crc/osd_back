const stringToNumber = (req, res, next) => {
  const StoN = () => {
    return new Promise((resolve, reject) => {
      let arr = [];
      for (let key in req.body) {
        arr.push(new Promise((resolve, reject) => {
          if (!isNaN(parseInt(req.body[key]))) {
            req.body[key] = parseInt(req.body[key]);
          }
          resolve(true);
        }));
      };
      Promise.all(arr).then((data) => {
        return resolve(true);
      }).catch((err) => {
        console.error(err);
        return resolve(true);
      });
    });
  };

  const respon = () => {
    console.log("success");
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
