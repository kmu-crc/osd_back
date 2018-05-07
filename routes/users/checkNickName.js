const { isOnlyNicName } = require("../../middlewares/verifications");

const checkEmail = (req, res) => {
  const respond = (data) => {
    res.status(200).json({
      success: true,
      message: "사용가능한 닉네임입니다."
    });
  };

  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  isOnlyNicName(req.body.nick_name)
  .then(respond)
  .catch(error);
};

module.exports = checkEmail;
