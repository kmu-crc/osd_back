const { isOnlyFBId } = require("../../middlewares/verifications");

const checkEmail = (req, res) => {
  const respond = (data) => {
    res.status(200).json({
      success: true,
      message: "회원가입이 가능합니다."
    });
  };

  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  isOnlyFBId(req.body.FB_user_id)
  .then(respond)
  .catch(error);
};

module.exports = checkEmail;
