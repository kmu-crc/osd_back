const express = require("express");
const router = express.Router();

// const { findPw } = require("./resetMail");
// router.use("/check", auth, check);
// router.get("/myPage", auth, myPage);
// router.post("/findPw", findPw);
// routes
router.get('/', (req, res, next) => {
  res.status(200).json({ message: "HELLO" });
});

// app.get('/check/:id', (req, res, next) => {
//   const { id } = req.params;
//   const found = roomAndMembers.filter(e => e.room === id);
//   res.status(200).json({ exists: found.length ? true : false });
//   // const found = rooms.includes(req.params.id);
//   // res.status(200).json({ exists: found ? true : false });
// });

// app.get('/checkAlreadyThereIn/:id/:mem', (req, res, next) => {
//   const { id, mem } = req.params;
//   const found = roomAndMembers.filter(e => e.id === mem && e.room === id);
//   res.status(200).json({ exists: found.length ? true : false });
// });

module.exports = router;
