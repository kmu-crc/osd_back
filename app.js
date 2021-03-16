const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require('fs');

require("dotenv").config();

const routers = require("./routes");

const app = express();

const schedule = require('node-schedule');
const connection = require("./configs/connection");
const { resolve } = require("path");
const { rejects } = require("assert");
 
console.log('오래된 디자인 채팅 메시지를 지우는 타임 스케줄러가 시작되었습니다.');
console.log('(매주 토요일 오후 11시 59분에 현재시간으로부터 3개월보다 오래된 메시지를 지웁니다.)');

const sql = `
set sql_safe_updates = 0;
DELETE FROM market.message WHERE create_time <= date_add(NOW(),interval -1 year);
DELETE FROM market.alarm2 WHERE create_time <= date_add(NOW(),interval -1 year);
DELETE FROM market.gallery WHERE update_time <= date_add(NOW(),interval -1 year);
DELETE FROM market.gallery_item WHERE update_time <= date_add(NOW(),interval -1 year);
DELETE FROM market.payment WHERE create_time <= date_add(NOW(),interval -1 year);
DELETE FROM market.point_history WHERE create_time <= date_add(NOW(),interval -1 year);
DELETE FROM market.purchaseMessage WHERE create_time <= date_add(NOW(),interval -1 year);
DELETE FROM market.question WHERE create_time <= date_add(NOW(),interval -1 year);
DELETE FROM market.request WHERE update_time <= date_add(NOW(),interval -1 year);
DELETE FROM market.review WHERE create_time <= date_add(NOW(),interval -1 year);
UPDATE market.item SET active=0
where update_time<= date_add(NOW(),interval -1 year);


`;
schedule.scheduleJob({ hour: 23, minute: 59, dayOfWeek: 6}, function(){

  connection.query(sql, (err, row)=>{
    if(!err){
      console.log('design chat message removed.');
    }else{
      console.error('sql error: ', err);
    }
  }); 
});

// schedule.scheduleJob({ hour: 23, minute: 59, dayOfWeek: 6}, function(){
//   // 해당컬럼불러오기
//   // 유저테이블 업데이트
//   // 익스퍼트테이블 업데이트

//   const getPayUser= ()=>{
//     return new Promise((resolve,reject)=>{
//       connection.query(`SELECT U.uid, E.uid as expert_id FROM market.user U
//           LEFT JOIN market.expert E ON U.uid = E.user_id
//           where U.point>=2000 AND E.isPayDate<= date_sub(NOW(),interval 1 month);`, (err, row)=>{
//         if(!err){
//           resolve(row);
//         }else{
//           console.error('sql error: ', err);
//           reject(err);
//         }
//       }); 
//     })
//   }

//   const billPoint=(row)=>{
//     return new Promise(()=>{
//       Promise.all(row.map((item,index)=>{
//         return new Promise((resolve,reject)=>{
//           connection.query(`UPDATE market.user U SET U.point=IF(U.point) WHERE U.uid=${item.uid}`, (err, row)=>{
//             if(!err){
//               resolve(true);
//             }else{
//               console.error('sql error: ', err);
//               reject(err);
//             }
//           }); 
//         }) 
//       })).then(resolve(row))
//     })
//   }

//   const updatePayDate=(row)=>{
//     Promise.all(row.map((item,index)=>{
//       return new Promise((resolve,reject)=>{
//         connection.query(`UPDATE market.expert E SET E.isPayDate=NOW(), (err, row)=>{
//           if(!err){
//             resolve(row);
//           }else{
//             console.error('sql error: ', err);
//             reject(err);
//           }
//         }); 
//       }) 
//     }))
//   }
// });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.all('/*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.set("jwt-secret", process.env.SECRET_CODE);

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json({ limit: "1gb" }));
app.use(bodyParser.urlencoded({ limit: "1gb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use("/userFile", express.static("uploads"));
app.use("/thumbnails", express.static("thumbnails"));
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}
if (!fs.existsSync('./thumbnails')) {
  fs.mkdirSync('./thumbnails');
}
app.use("/", routers);

app.use("/check", function (req, res, next) {
  res.status(200).json({ message: "success" });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "OPTIONS, GET, POST, PUT, PATCH, DELETE" // what matters here is that OPTIONS is present
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    success: false,
    message: err.message
  });
});

module.exports = app;
