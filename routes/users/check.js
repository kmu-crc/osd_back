const { isUserDetail } = require("../../middlewares/verifications");

const check = (req, res) => {
  const respond = (data) => {
    res.status(200).json({
      success: true,
      info: req.decoded
    });
  };

  isUserDetail(req.decoded.uid)
  .then((isDetail) => {
    req.decoded.isDetail = isDetail;
    return respond();
  });
};

module.exports = check;
