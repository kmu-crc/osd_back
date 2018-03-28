const express = require("express");
const path = require("path");
const router = express.Router();
const signUp = require("./signUp");
const signIn = require("./signIn");
const check = require("./check");
const auth = require("../../middlewares/auth");
const { FBSignIn, FBSignUp } = require("./FBRegistration");
const { insertDetail } = require("./userDetail");
const stringToNumber = require("../../middlewares/stringToNumber");

// thumbnail 만드는데 사용되는 middleware
const multer = require("multer"); // express에 multer모듈 적용 (for 파일업로드);
const createThumbnail = require("../../middlewares/createThumbnail");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, new Date().valueOf() + path.extname(file.originalname)); // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
});
const upload = multer({ storage: storage });

router.post("/signUp", signUp, signIn);
router.post("/signIn", signIn);

router.use("/check", auth, check);

router.post("/FBSignUp", FBSignUp, FBSignIn);

router.post("/FBSignIn", FBSignIn, FBSignUp, FBSignIn);

router.post("/insertDetail", auth, upload.single("thumbnail"), createThumbnail, stringToNumber, insertDetail);

module.exports = router;
