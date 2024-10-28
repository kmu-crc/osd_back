const stringToNumber = (req, res, next) => {
  // console.log(req.body);
  //console.log("sTn", req.files);
  const StoN = () => {
    return new Promise((resolve, reject) => {
      let arr = [];
      //console.log("sTn", req.body);
      for (let key in req.body) {
        arr.push(new Promise((resolve, reject) => {
          if (!isNaN(parseInt(req.body[key]))) {
            if (key === "password" || key === "password2" || key === "nick_name" || key === "explanation" || key === "title" || key === "about_me"||key === "careerlist" ){
              resolve(true);
            } else {
              req.body[key] = parseInt(req.body[key]);
            }
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

  StoN()
    .then(respon)
    .catch(onError);
};

module.exports = stringToNumber;
