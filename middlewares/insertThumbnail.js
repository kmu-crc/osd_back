const path = require("path");
const multer = require("multer"); // express에 multer모듈 적용 (for 파일업로드);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, new Date().valueOf() + path.extname(file.originalname)); // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
});
const upload = multer({ storage: storage });

const imageUpload = (req, res, next) => {
  const thisUpload = upload.single("thumbnail");
  console.log(thisUpload);
  thisUpload(req, res, (err) => {
    if (err) {
      next(err);
    }
    if (req.file) {
      next();
    } else {
      req.file = null;
      next();
    }
  });
};

module.exports = imageUpload;
