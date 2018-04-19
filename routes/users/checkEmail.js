const { isOnlyEmail } = require("../../middlewares/verifications");

const checkEmail = (req, res) => {
  const respond = (data) => {
    res.status(200).json({
      success: true,
      message: "사용가능한 email 입니다."
    });
  };

  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  isOnlyEmail(req.body.email)
  .then(respond)
  .catch(error);
};

module.exports = checkEmail;
