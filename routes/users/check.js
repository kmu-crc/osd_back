const check = (req, res) => {
  res.status(200).json({
    success: true,
    info: req.decoded
  });
};

module.exports = check;
