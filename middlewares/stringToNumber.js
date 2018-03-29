const stringToNumber = (req, res, next) => {
  const StoN = () => {
    return new Promise((resolve, reject) => {
      let arr = [];
      for (let key in req.body) {
        arr.push(new Promise((resolve, reject) => {
          console.log(key, parseInt(req.body[key]));
          if (parseInt(req.body[key])) {
            req.body[key] = parseInt(req.body[key]);
          }
          resolve(true);
        }));
      };
      Promise.all(arr).then((data) => {
        console.log("all", data);
        return resolve(true);
      }).catch((err) => {
        console.log(err);
        return resolve(true);
      });
    });
  };

  const respon = () => {
    console.log("success");
    next();
  };

  const onError = (error) => {
    console.log("error22");
    res.status(500).json({
      error: error
    });
  };

  StoN()
  .then(respon)
  .catch(onError);
};

module.exports = stringToNumber;
