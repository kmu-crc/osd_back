const connection = require("../configs/connection");

function countAlarm(uid) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT count(confirm) FROM alarm WHERE user_id = ${uid} AND confirm = 0`,
      (err, rows) => {
        if (!err) {
          resolve(rows[0]["count(confirm)"]);
        } else {
          //console.log("2번", err);
          reject(err);
        }
      }
    );
  });
}

function sendAlarm(socketId, uid, count, io) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM alarm WHERE user_id = ${uid} ORDER BY confirm, create_time DESC`,
      (err, rows) => {
        if (!err) {
          addTitle(socketId, { count, list: rows }, io, uid);
        } else {
          //console.log("2번", err);
          reject(err);
        }
      }
    );
  });
}

function addTitle(socketId, alarm, io, uid) {
  return new Promise(async (resolve, reject) => {
    let newList = [];
    for (let item of alarm.list) {
      let query = null;
      let target = null;
      let isDesign = 1;
      if (item.type === "MESSAGE") {
        query = `SELECT nick_name FROM user WHERE uid = ${item.from_user_id}`;
        target = "nick_name";
      } else if (item.type === "DESIGN") {
        isDesign = await DoesItExistDesign(item.content_id);
        query = `SELECT title FROM design WHERE uid = ${item.content_id}`;
        target = "title";
      } else if (item.type === "GROUP") {
        isDesign = await DoesItExistGroup(item.content_id);
        query = `SELECT title FROM opendesign.group WHERE uid = ${
          item.content_id
          }`;
        target = "title";
      }
      if (isDesign) {
        item.title = await getTitle(query, target);
      } else {
        continue;
      }
      item.fromUser = await getNickName(item.from_user_id);
      newList.push(item);
      //console.log("newList", newList);
    }
    Promise.all(newList).then(item => { alarm.list = item; io.to(`${socketId}`).emit("getNoti", alarm); }).catch(err => console.log(err));
  })
}

function DoesItExistDesign(uid) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT count(uid) FROM design WHERE uid = ${uid}`,
      (err, rows) => {
        if (!err) {
          resolve(rows[0]["count(uid)"]);
        } else {
          //console.log("2번", err);
          reject(err);
        }
      }
    );
  });
}
function DoesItExistGroup(uid) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT count(uid) FROM opendesign.group WHERE uid = ${uid}`,
      (err, rows) => {
        if (!err) {
          resolve(rows[0]["count(uid)"]);
        } else {
          //console.log("2번", err);
          reject(err);
        }
      }
    );
  });
}

function getTitle(query, target) {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, rows) => {
      if (!err && rows.length > 0) {
        resolve(rows[0][target]);
      } else if (!err && rows.length) {
        resolve(null);
      } else {
        //console.log("3번", err);
        reject(err);
      }
    });
  });
}

function getNickName(uid) {
  return new Promise((resolve, reject) => {
    if (uid == null) resolve(null);
    connection.query(
      `SELECT nick_name FROM user WHERE uid = ${uid}`,
      (err, rows) => {
        if (!err && rows.length > 0) {
          resolve(rows[0].nick_name);
        } else if (rows.length) {
          resolve(null);
        } else {
          //console.log("1번", err);
          reject(err);
        }
      }
    );
  });
}

exports.GetAlarm = (socketId, uid, io) => {
  // console.log("?????");
  countAlarm(uid)
    .then(count => sendAlarm(socketId, uid, count, io))
    .catch();
}

// uid, user_id, from_user_id, type, kinds, content_id, confirm, create_time
function getTitleById(type, content_id) {
  return new Promise((resolve, reject) => {
    const table = type === "DESIGN" ? "opendesign.design" : "opendesign.group"
    // console.log(`SELECT title FROM ${table} WHERE uid=${content_id}`)
    connection.query(`SELECT title FROM ${table} WHERE uid=${content_id}`, (error, rows) => {
      if (!error) {
        if (rows.length > 0)
          resolve(rows[0]["title"])
        else
          resolve('unknown')
      } else {
        reject(`getTitleById:` + error)
      }
    })
  })
}
function validContentId(type, content_id) {
  let table = "opendesign.design";
 if(type === "DESIGN") table = "opendesign.design";
 if(type === "GROUP") table = "opendesign.group"
 if(type === "DESIGNER") table = "opendesign.user";

  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT count(uid) FROM ${table} WHERE uid = ${content_id}`,
      (err, rows) => {
        if (!err) {
          resolve(rows[0]["count(uid)"] > 0 ? true : false)
        } else {
          //console.log("2번", err);
          reject(err);
        }
      }
    )
  })
}
function getAlarmList(uid) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM opendesign.alarm T WHERE T.user_id=${uid} AND T.type !="MESSAGE" ORDER BY confirm, create_time DESC`, (error, rows) => {
      if (!error) {
        // console.log(rows)
        resolve(rows)
      } else {
        reject(`getAlarms:` + error)
      }
    })
  })
}
function getMsgCount(uid) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT count(*) FROM opendesign.alarm T WHERE T.user_id=${uid} AND T.type ="MESSAGE" AND T.confirm=0`, (error, rows) => {
      if (!error) {
        resolve(rows[0]["count(*)"])
      } else {
        reject(`getAlarms:` + error)
      }
    })
  })
}
function getThumbnail(type, content_id) {
  return new Promise((resolve, reject) => {
    const table = type === "DESIGN" ? "opendesign.design" : "opendesign.group"
    connection.query(`SELECT T.s_img FROM opendesign.thumbnail T WHERE uid IN( SELECT D.thumbnail FROM ${table} D WHERE uid=${content_id})`, (error, rows) => {
      if (!error) {
        if (rows.length > 0)
          resolve(rows[0]["s_img"])
        else
          resolve(null)
      } else {
        reject(`getThumbnail:` + error)
      }
    })
  })
}
function getLastComment(comment_id) {
//const sql = `SELECT DC.comment FROM opendesign.design_comment DC WHERE design_id IN (SELECT content_id FROM alarm A WHERE user_id=${user_id} AND A.type="DESIGN" AND (A.kinds="COMMENT" OR A.kinds="COMMENT_COMMENT")) ORDER BY create_time DESC LIMIT 1;`
//console.log(sql)
const sql = `SELECT comment FROM opendesign.design_comment WHERE uid =${comment_id}`
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, rows) => {
      if (!error) {
        if (rows.length > 0){
          resolve(rows[0]["comment"])}
        else
          resolve(null)
      } else {
        reject(`getLastComment:` + error)
      }
    })
  })
}
function attachCommentToAlarm(list){
  return new Promise(async (resolve, reject) => {
    for (let item of list) {
	let condition =  (item.type ==="DESIGN" &&(item.kinds === "COMMENT"||item.type ==="COMMENT_COMMENT")) 
	//console.log(condition, "codition")
      item.reply_preview = await getLastComment(item.sub_content_id)
    }
    
    for (let item of list) {
       //console.log("preview:", item.reply_preview)
    }
    resolve(list)
  })
}
function extendAlarm(list) {
  return new Promise(async (resolve, reject) => {
    for (let item of list) {
      item.is_alive = item.content_id ? await validContentId(item.type, item.content_id) : 0
      // item.confirm === 0 && console.log(item.is_alive, item.uid)
    }
    let newlist = list.filter(item => item.is_alive > 0)

    for (let item of newlist) {
      item.from = item.from_user_id ? await getNickName(item.from_user_id) : null
      item.to = item.user_id ? await getNickName(item.user_id) : null
      item.title = item.content_id ? await getTitleById(item.type, item.content_id) : null
      item.thumbnail = item.content_id && item.type ? await getThumbnail(item.type, item.content_id) : null
      item.targetThumbnail = item.sub_content_id && item.type ? await getThumbnail(item.type, item.sub_content_id) : null
    }
    resolve(newlist)
  })
}
function countUnconfirmAlarm(uid, list) {
  return new Promise((resolve, reject) => {
    let cntAlarm = 0
    for (item of list) {
      if (item.confirm === 0)
        cntAlarm++
    }
    getMsgCount(uid)
      .then(msg => resolve({ alarm: cntAlarm, msg: msg }))
  })
}
function sendAlarmList(socketId, uid, newlist, io) {
  return new Promise((resolve, reject) => {
    // Promise.all(newlist)
    // .then(() => 
    countUnconfirmAlarm(uid, newlist) // )
      .then(count => { 
//console.log("count.msg:", count.msg)
io.to(`${socketId}`).emit("getNoti", { count: count.alarm, countMsg: count.msg, list: newlist }) })
      .catch(error => console.log(`ERR: send noti, ${error}`))
  })
}
function getMsgAlarmList(uid) {
  return new Promise((resolve, reject) => {
    connection.query(`
    SELECT distinct from_user_id, count(confirm) as 'cnt' from alarm where user_id = ${uid} AND confirm = 0 AND alarm.type = "MESSAGE" group by from_user_id`
      , (error, rows) => {
        if (!error) {
          resolve(rows)
        } else {
          reject(`getmsgalarmlist:` + error)
        }
      })
  })
}

exports.newGetMsg = (socketId, uid, io) => {
  getMsgAlarmList(uid)
    .then(list => io.to(`${socketId}`).emit("getMsgAlarm", list))// sendMsgAlarmList(socketId, uid, list, io))
    .catch(error => console.log(error))
}
exports.newGetAlarm = (socketId, uid, io) => {
  getAlarmList(uid)
    .then(list => extendAlarm(list))
    .then(list => attachCommentToAlarm(list))
    .then(extList => sendAlarmList(socketId, uid, extList, io))
    .catch(error => console.log(error))
}
exports.SendAlarm = (socketId, uid, contentId, message, fromUserId, io, subContentId) => {
  let type = null;
  let kinds = null;
  let sub_content_id = subContentId;
  if (message === "ReceiveMsg") {
    type = "MESSAGE";
    kinds = "SEND";
  } else if (message === "DesignInvite") {
    type = "DESIGN";
    kinds = "INVITE";
  } else if (message === "DesignRequest") {
    type = "DESIGN";
    kinds = "REQUEST";
  } else if (message === "DesignInvitedTrue") {
    type = "DESIGN";
    kinds = "INVITE_TRUE";
  } else if (message === "DesignRequestTrue") {
    type = "DESIGN";
    kinds = "REQUEST_TRUE";
  } else if (message === "DesignRefuse") {
    type = "DESIGN";
    kinds = "REFUSE";
  } else if (message === "DesignGetout") {
    type = "DESIGN";
    kinds = "GETOUT";
  } else if (message === "DesignInviteReject") {
    type = "DESIGN";
    kinds = "INVITE_REJECT";
  } else if (message === "JoinGroupWithDesign") {
    type = "GROUP";
    kinds = "JOIN_withDESIGN";
  } else if (message === "JoinGroupWithGroup") {
    type = "GROUP";
    kinds = "JOIN_withGROUP";
  } else if (message === "JoinGroupSuccess") {
    type = "GROUP";
    kinds = "JOINSUCCESS";
  } else if (message === "DesignOutFromGroup"){
    type = "GROUP"
    kinds = "GROUP_DESIGN_OUT"
  } else if (message === "JoinGroupRefuse") {
    type = "GROUP";
    kinds = "JOINREFUSE";
  } else if (message === "Likedesign") {
    type = "DESIGN";
    kinds = "LIKE";
  } else if (message === "LikeGroup") {
    type = "GROUP";
    kinds = "LIKE";
  } else if (message === "LikeDesigner"){
    type = "DESIGNER";
    kinds = "LIKE";
  } else if (message === "CommentDesign") {
    type = "DESIGN";
    kinds = "COMMENT";
    sub_content_id = subContentId
  } else if (message === "CommentDesignCard") {
    type = "DESIGN"
    kinds = "CARD_COMMENT"
    sub_content_id = subContentId
  } else if (message === "CommentComment") {
    type = "DESIGN"
    kinds = "COMMENT_COMMENT"
    sub_content_id = subContentId
  }

  function insertAlarm(uid, type, kinds, content_id, fromUserId, subContentId) {
    return new Promise((resolve, reject) => {
      let SET = { user_id: uid, type, kinds, content_id, from_user_id: fromUserId, confirm: 0, sub_content_id:subContentId};
      SET.sub_content_id = subContentId === null ? null : subContentId
      connection.query(
        "INSERT INTO alarm SET ?", SET,
        (err, rows) => {
          if (!err) {
            resolve(true)
          } else {
            //console.log("2번", err);
            reject(err)
          }
        }
      )
    })
  }

  insertAlarm(uid, type, kinds, contentId, fromUserId, sub_content_id)
    .then(() => getAlarmList(uid))
    .then(list => extendAlarm(list))
    .then(extList => { sendAlarmList(socketId, uid, extList, io) })
    .catch(error => console.log(error))
}
