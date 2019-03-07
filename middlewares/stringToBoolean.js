const stringToBoolean = (req, res, next) => {
  const StoB = () => {
    return new Promise((resolve, reject) => {
      let arr = [];
      //console.log(req.body);
      for (let key in req.body) {
        arr.push(new Promise((resolve, reject) => {
          if (req.body[key] === "true") {
            req.body[key] = true;
          } else if (req.body[key] === "false") {
            req.body[key] = false;
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
    //console.log("success");
    next();
  };

  const onError = (error) => {
    res.status(500).json({
      error: error
    });
  };

  StoB()
    .then(respon)
    .catch(onError);
};

module.exports = stringToBoolean;
