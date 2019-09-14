var connection = require("../../configs/connection");

// 디자인 디테일 정보 가져오기 (GET)
exports.designDetail = (req, res, next) => {
  const designId = req.params.id;
  let loginId;
  if (req.decoded !== null) {
    loginId = req.decoded.uid;
  } else {
    loginId = null;
  }

  // 디자인 기본 정보 가져오기
  function getDesignInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design WHERE uid = ?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  // 등록자 닉네임 가져오기
  function getName (data) {
    const p = new Promise((resolve, reject) => {
      if (data.user_id === null) {
        data.userName = null;
        resolve(data);
      } else {
        connection.query(
          "SELECT nick_name FROM user WHERE uid = ?",
          data.user_id,
          (err, result) => {
            if (!err) {
              data.userName = result[0].nick_name;
              resolve(data);
            } else {
              reject(err);
            }
          }
        );
      }
    });
    return p;
  }

  // 카테고리 이름 가져오기
  function getCategory (data) {
    const p = new Promise((resolve, reject) => {
      let cate;
      let sql;
      if (!data.category_level1 && !data.category_level2) {
        data.categoryName = null;
        resolve(data);
      } else if (data.category_level2 && data.category_level2 !== "") {
        cate = data.category_level2;
        sql = "SELECT name FROM category_level2 WHERE uid = ?";
      } else {
        cate = data.category_level1;
        sql = "SELECT name FROM category_level1 WHERE uid = ?";
      }
      connection.query(sql, cate, (err, result) => {
        if (!err) {
          data.categoryName = result[0].name;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  // 디자인 썸네일 가져오기 (GET)
  function getThumnbail (data) {
    const p = new Promise((resolve, reject) => {
      if (data.thumbnail === null) {
        data.img = null;
        resolve(data);
      } else {
        connection.query(
          "SELECT s_img, m_img, l_img FROM thumbnail WHERE uid = ?",
          data.thumbnail,
          (err, row) => {
            if (!err && row.length === 0) {
              data.img = null;
              resolve(data);
            } else if (!err && row.length > 0) {
              data.img = row[0];
              resolve(data);
            } else {
              reject(err);
            }
          }
        );
      }
    });
    return p;
  }

  // 속한 멤버들의 id, 닉네임 리스트 가져오기
  function getMemberList (data) {
    const p = new Promise((resolve, reject) => {
      connection.query(
        "SELECT D.user_id, U.nick_name FROM design_member D JOIN user U ON U.uid = D.user_id WHERE D.design_id = ? AND D.is_join = 1",
        data.uid,
        (err, row) => {
          if (!err && row.length === 0) {
            data.member = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.member = row;
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
    return p;
  }

  // 파생된 디자인 수 가져오기
  function getChildrenCount (data) {
    const p = new Promise((resolve, reject) => {
      connection.query(
        "SELECT count(*) FROM design WHERE parent_design = ?",
        data.uid,
        (err, result) => {
          if (!err) {
            data.children_count = result[0];
            //console.log(data);
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
    return p;
  }

  // 내가 디자인 멤버인지 검증하기
  function isTeam (data) {
    const p = new Promise((resolve, reject) => {
      if (loginId === null) {
        data.is_team = 0;
        resolve(data);
      } else {
        connection.query(
          `SELECT * FROM design_member WHERE design_id = ${
            data.uid
          } AND user_id = ${loginId} AND is_join = 1`,
          (err, result) => {
            if (!err && result.length === 0) {
              data.is_team = 0;
              resolve(data);
            } else if (!err && result.length > 0) {
              data.is_team = 1;
              resolve(data);
            } else {
              //console.log(err);
              reject(err);
            }
          }
        );
      }
    });
    return p;
  }

  // 내가 가입 신청중인 디자인인지 검증하기
  function waiting (data) {
    const p = new Promise((resolve, reject) => {
      if (loginId === null) {
        data.waitingStatus = 0;
        resolve(data);
      } else {
        connection.query(
          `SELECT * FROM design_member WHERE design_id = ${
            data.uid
          } AND user_id = ${loginId} AND is_join = 0`,
          (err, result) => {
            if (!err && result.length === 0) {
              data.waitingStatus = 0;
              resolve(data);
            } else if (!err && result.length > 0) {
              data.waitingStatus = 1;
              resolve(data);
            } else {
              //console.log(err);
              reject(err);
            }
          }
        );
      }
    });
    return p;
  }

  // 맴버 섬네일 가져오기
  const getThumbnailId = id => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT thumbnail FROM user WHERE uid = ${id}`,
        (err, result) => {
          if (!err) {
            //console.log("member: ", result[0]);
            resolve(result[0].thumbnail);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  const getThumbnail = id => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM thumbnail WHERE uid = ${id}`,
        (err, result) => {
          if (!err) {
            //console.log("member: ", result[0]);
            resolve(result[0]);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  const memberLoop = list => {
    return new Promise(async (resolve, reject) => {
      let newList = [];
      if (!list || list.length === 0) {
        resolve(null);
      } else {
        for (let item of list) {
          try {
            let thumbnail = await getThumbnailId(item.user_id);
            if (thumbnail) {
              item.thumbnail = await getThumbnail(thumbnail);
            } else {
              item.thumbnail = null;
            }
            newList.push(item);
          } catch (err) {
            newList.push(err);
          }
        }
        Promise.all(newList)
          .then(data => {
            //console.log("members", data);
            return resolve(data);
          })
          .catch(err => reject(err));
      }
    });
  };

  // 맴버 가져오기
  const getMembers = (data, designId) => {
    return new Promise(async (resolve, reject) => {
      try {
        data.member = await memberLoop(data.member);
        //console.log("dddddata", data);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  };

  // 가장 최근 업데이트된 이슈 제목 가져오기
  function getIssueTitle (data) {
    const p = new Promise((resolve, reject) => {
      connection.query(
        `SELECT uid, title, update_time FROM design_issue WHERE design_id = ${
          data.uid
        } ORDER BY update_time DESC`,
        (err, result) => {
          if (!err && result.length === 0) {
            data.mainIssue = null;
            resolve(data);
          } else if (!err && result.length > 0) {
            data.mainIssue = result[0];
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
    return p;
  }

  function getIsParent(data){
    return new Promise((resolve, reject) => {
      connection.query(`SELECT count(*) FROM opendesign.design WHERE parent_design=${data.uid};`, (err, result) => {
        if(!err && result[0]["count(*)"] === 0) {
          data.is_parent = false
          resolve(data)
        } else if (!err && result[0]["count(*)"] > 0) {
          data.is_parent = true
          resolve(data)
        } else {
          reject(err)
        }
      })
    })
  }

  function getParentTitle(data){
    return new Promise((resolve, reject) => {
      connection.query(`SELECT title FROM opendesign.design WHERE uid=${data.parent_design};`, (err, result) => {
          if (!err && result.length === 0) {
            data.parent_title = null;
            resolve(data);
          } else if (!err && result.length > 0) {
            data.parent_title = result[0]["title"];
            resolve(data);
          } else {
            reject(err);
          }
      })
    })
  }


  getDesignInfo(designId)
    .then(getName)
    .then(getCategory)
    .then(getThumnbail)
    .then(getMemberList)
    .then(getChildrenCount)
    .then(getParentTitle)
    .then(isTeam)
    .then(waiting)
    // .then(getIssueTitle)
    .then(getIsParent)
    .then(data => getMembers(data, designId))
    .then(data => res.status(200).json(data))
    .catch(err => res.status(200).json(err));
};

// 좋아요 수, 조회수, 멤버수, 카드수 정보 가져오기
exports.getCount = (req, res, next) => {
  const designId = req.params.id;

  function getCount (id) {
    const p = new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM design_counter WHERE design_id = ?",
        id,
        (err, row) => {
          if (!err) {
            //console.log(row[0]);
            res.status(200).json(row[0]);
          } else {
            //console.log(err);
            res.status(500).json(err);
          }
        }
      );
    });
    return p;
  }

  getCount(designId);
};

// 디자인 조회수 업데이트
exports.updateViewCount = (req, res, next) => {
  const designId = req.params.id;

  function updateDesignView (id) {
    const p = new Promise((resolve, reject) => {
      connection.query(
        "UPDATE design_counter SET view_count = view_count + 1 WHERE design_id = ?",
        id,
        (err, row) => {
          if (!err) {
            //console.log(row[0]);
            resolve(id);
          } else {
            //console.log(err);
            reject(err);
          }
        }
      );
    });
    return p;
  }

  function updateUserView (id) {
    const p = new Promise((resolve, reject) => {
      connection.query(
        `UPDATE user_counter C
      INNER JOIN design D ON C.user_id = D.user_id
      SET C.total_view = C.total_view + 1 WHERE D.uid = ${id}`,
        (err, row) => {
          if (!err) {
            //console.log(row);
            res.status(200).json({ success: true });
          } else {
            //console.log(err);
            res.status(200).json({ success: false });
          }
        }
      );
    });
    return p;
  }

  updateDesignView(designId)
    .then(updateUserView);
};

// 블로그형 디자인 프로젝트형으로 변경
exports.changeToProject = (req, res, next) => {
  const id = req.params.id;

  function changeToProject (id) {
    const p = new Promise((resolve, reject) => {
      connection.query(
        `UPDATE design SET is_project = 1, update_time = now() WHERE uid = ${id}`,
        (err, row) => {
          if (!err) {
            resolve(true);
          } else {
            //console.log(err);
            reject(err);
          }
        }
      );
    });
    return p;
  }

  // 기존 블로그형 디자인에 컨텐츠가 없을 경우, 보드와 카드 삭제 (초기화 상태로 만듦)
  function ifExistContent (id) {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM design_content C JOIN design_card D ON D.design_id = ${id} WHERE C.card_id = D.uid`, (err, row) => {
        if (!err && row.length === 0) {
          //console.log("디자인 없음", row);
          resolve(false);
        } else if (!err && row.length > 0) {
          //console.log("디자인 있음", row);
          resolve(true);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
    return p;
  }

  function clearBoardCard (result) {
    const p = new Promise((resolve, reject) => {
      if (result) {
        resolve(true);
      } else {
        connection.query(`DELETE FROM design_board WHERE design_id = ${id}`, (err, row) => {
          if (!err) {
            //console.log("디자인 지움");
            resolve(true);
          } else {
            //console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  }

  const respond = () => {
    res.status(200).json({
      success: true
    });
  };

  const error = (err) => {
    res.status(500).json({
      err: err,
      success: false
    });
  };

  ifExistContent(id)
    .then(clearBoardCard)
    .then(() => changeToProject(id))
    .then(respond)
    .catch(error);
};

// design의 댓글
exports.getDesignComment = (req, res, next) => {
  const id = req.params.id;

  const getComment = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT C.uid, C.user_id, C.design_id, C.comment, C.create_time, C.update_time, C.d_flag, U.nick_name, T.s_img FROM design_comment C LEFT JOIN user U ON U.uid = C.user_id LEFT JOIN thumbnail T ON T.uid = U.thumbnail WHERE C.design_id = ?", id, (err, row) => {
        if (!err) {
          //console.log("get", row);
          resolve(row);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const success = (data) => {
    res.status(200).json({
      success: true,
      data: data
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false,
      data: null
    });
  };

  getComment(id)
    .then(success)
    .catch(fail);
};

const getSocketId = uid => {
  return new Promise((resolve, reject) => {
    // console.log("uid", uid);
    connection.query(
      `SELECT socket_id FROM user WHERE uid = ${uid}`,
      (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          resolve({ socketId: row[0].socket_id });
        } else {
          console.log(err);
          reject(err);
        }
      }
    );
  });
};

const getDesignUserId = id => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM design WHERE uid=${id}`,
      (err, rows) => {
        if (!err) {
          resolve(rows[0].user_id);
        } else {
          const errorMessage = "댓글달기를 실패하였습니다.";
          reject(errorMessage);
        }
      }
    );
  });
};
const SendAlarm= async (fromId, contentId) => {
  const { sendAlarm } = require("../../socket");
  const receiver = await getDesignUserId(contentId)
  if(fromId === receiver) return;
  await getSocketId(receiver)
    .then(socket =>
      sendAlarm(socket.socketId, receiver, contentId, "CommentDesign", fromId)) 
};
const SendCommentCommentAlarm= async (toId, fromId, contentId) => {
  const { sendAlarm } = require("../../socket");
  if(toId===fromId) return;
  await getSocketId(toId)
    .then(socket =>
      sendAlarm(socket.socketId, toId, contentId, "CommentComment", fromId)) 
};
const getUserIdByName = name=>{
    return new Promise((resolve, reject) => {
    // console.log("uid", uid);
    connection.query(
      `SELECT * FROM user WHERE nick_name LIKE '${name}'`,
      (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          resolve(row[0].uid);
        } else {
          console.log(err);
          reject(err);
        }
      }
    );
  });
}
exports.createDetailComment = async (req, res, next) => {
  req.body["user_id"] = req.decoded.uid;
  req.body["design_id"] = req.params.id;
  // console.log("req.body.comment", req.body.comment);
  const _ = req.body.comment.match(/^@.*\s\s/)//[0].trim()
  let reply = null
  if(_ !== null)
  {
    reply = await getUserIdByName(_[0].trim().substring(1)) 
  }
  const createComment = (data) => {
    // console.log("DATA:", data);
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO design_comment SET ?", data, (err, row) => {
        if (!err) {
          //console.log("create", row);
          resolve(row);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };
  
  const updateCardCount = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("UPDATE design_counter SET comment_count = comment_count + 1 WHERE design_id = ?", id, (err, row) => {
        if (!err) {
          reply!==null?
            SendCommentCommentAlarm(reply, req.decoded.uid, req.params.id)
            :SendAlarm(req.decoded.uid, req.params.id)
          //console.log("update", row);
          resolve(row);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  createComment(req.body)
    .then(() => updateCardCount(req.params.id))
    .then(success)
    .catch(fail);
};

exports.deleteDetailComment = (req, res, next) => {
  const designId = req.params.id;
  const cmtId = req.params.comment_id;

  const deleteComment = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM design_comment WHERE design_id = ${designId} AND uid = ${cmtId}`, (err, row) => {
        if (!err) {
          //console.log("delete", row);
          resolve(row);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const updateCardCount = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("UPDATE design_counter SET comment_count = comment_count - 1 WHERE design_id = ?", id, (err, row) => {
        if (!err) {
          //console.log("update", row);
          resolve(row);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  deleteComment(req.body)
    .then(() => updateCardCount(designId))
    .then(success)
    .catch(fail);
};
