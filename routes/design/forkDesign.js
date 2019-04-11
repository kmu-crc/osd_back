const connection = require("../../configs/connection")

exports.forkDesign = async (req, res, next) => {
  let parent = req.params.id;
  let user_id = req.params.user_id;
  // let newchild = 99999;
  const respond = (uid) => {
    console.log("sent new id")
    res.status(200).json({
      success: true,
      new_design_id: uid,
      message: "파생디자인이 성공적으로 등록되었습니다."
    });
  };
  const reject = () => {
    res.status(200).json({
      success: false,
      message: "파생디자인 생성에 실패하였습니다."
    });
  };
  let sql = `
SET @PREFIX_STRING = '[파생됨] ';
SET @PARENT_DESIGN = ${parent};
SET @USER_ID = ${user_id};
SET SQL_SAFE_UPDATES = 0;
DROP TEMPORARY TABLE IF EXISTS t;
CREATE TEMPORARY TABLE IF NOT EXISTS t AS (SELECT NULL as uid, @USER_ID as user_id, title, explanation, thumbnail, category_level1, category_level2, is_commercial, is_public, is_modify, is_display_creater, @PARENT_DESIGN AS parent_design, NOW() AS create_time, NOW() AS update_time, is_project, is_members, d_flag FROM opendesign.design  WHERE uid = @PARENT_DESIGN);
INSERT INTO opendesign.thumbnail SELECT NULL AS uid, @USER_ID AS user_id, s_img, m_img, l_img FROM opendesign.thumbnail WHERE uid IN (SELECT thumbnail FROM t);
UPDATE t SET thumbnail = (SELECT @@IDENTITY);
UPDATE t SET title = CONCAT(@PREFIX_STRING, title);
UPDATE t SET explanation = CONCAT(@PREFIX_STRING, explanation);
INSERT INTO opendesign.design SELECT * FROM t;
SET @NEW_DESIGN_ID = (SELECT @@IDENTITY);
DROP TEMPORARY TABLE IF EXISTS t;
INSERT INTO opendesign.design_member SELECT NULL AS uid, @NEW_DESIGN_ID AS design_id, @USER_ID AS user_id, 1 AS is_join, NULL AS invited;
INSERT INTO opendesign.design_counter SELECT NULL AS uid, @NEW_DESIGN_ID AS design_id, 0 AS like_count, 1 AS member_count, card_count, 0 AS view_count, 0 AS comment_count FROM opendesign.design_counter WHERE design_id=@PARENT_DESIGN;
DROP TEMPORARY TABLE IF EXISTS tb;
CREATE TEMPORARY TABLE IF NOT EXISTS tb AS ( SELECT NULL AS uid, @USER_ID AS user_id, @NEW_DESIGN_ID AS design_id, B.title, B.order, NOW() AS create_time, NOW() AS update_time, B.d_flag FROM opendesign.design_board B WHERE design_id = @PARENT_DESIGN ORDER BY B.uid);
INSERT INTO opendesign.design_board SELECT * FROM tb;
CREATE TEMPORARY TABLE IF NOT EXISTS hash_key AS (SELECT @n:=@n+1 n, P.uid FROM opendesign.design_board P, (SELECT @n:=0) m WHERE design_id=@PARENT_DESIGN);
CREATE TEMPORARY TABLE IF NOT EXISTS hash_val AS (SELECT @n:=@n+1 n, C.uid FROM opendesign.design_board C, (SELECT @n:=0) m WHERE design_id=@NEW_DESIGN_ID);
CREATE TEMPORARY TABLE IF NOT EXISTS hash_board AS (SELECT P.uid AS 'KEY', C.uid AS 'VALUE' FROM hash_key P LEFT JOIN hash_val C ON(P.n=C.n));
DROP TEMPORARY TABLE IF EXISTS hash_key;
DROP TEMPORARY TABLE IF EXISTS hash_val;
DROP TEMPORARY TABLE IF EXISTS tb;
DROP TEMPORARY TABLE IF EXISTS tc;
CREATE TEMPORARY TABLE IF NOT EXISTS tc AS (SELECT NULL AS uid, @USER_ID AS user_id, @NEW_DESIGN_ID AS design_id, board_id, first_img, title, content, DC.order, is_complete_card, is_images, is_source, NOW() AS create_time, NOW() AS update_time, d_flag FROM opendesign.design_card DC WHERE DC.design_id = @PARENT_DESIGN);
UPDATE tc, hash_board SET tc.board_id = hash_board.VALUE WHERE tc.board_id = hash_board.KEY;
INSERT INTO opendesign.design_card SELECT * FROM tc;
CREATE TEMPORARY TABLE IF NOT EXISTS hash_key AS (SELECT @n:=@n+1 n, P.uid FROM opendesign.design_card P, (SELECT @n:=0) m WHERE design_id=@PARENT_DESIGN);
CREATE TEMPORARY TABLE IF NOT EXISTS hash_val AS (SELECT @n:=@n+1 n, C.uid FROM opendesign.design_card C, (SELECT @n:=0) m WHERE design_id=@NEW_DESIGN_ID);
CREATE TEMPORARY TABLE IF NOT EXISTS hash_card AS (SELECT P.uid AS 'key', C.uid AS 'value' FROM hash_key P LEFT JOIN hash_val C ON(P.n=C.n));
DROP TEMPORARY TABLE IF EXISTS hash_key;
DROP TEMPORARY TABLE IF EXISTS hash_val;
DROP TEMPORARY TABLE IF EXISTS tc;
DROP TEMPORARY TABLE IF EXISTS tcc;
CREATE TEMPORARY TABLE IF NOT EXISTS tcc AS (SELECT NULL AS uid, @USER_ID AS user_id, card_id, content, DC.type, data_type, extension, DC.order, file_name, NOW() AS create_time 
FROM opendesign.design_content DC WHERE card_id IN (SELECT uid FROM opendesign.design_card WHERE design_id=@PARENT_DESIGN));
UPDATE tcc, hash_card SET tcc.card_id = hash_card.value WHERE tcc.card_id = hash_card.key;
INSERT INTO opendesign.design_content SELECT * FROM tcc;
DROP TEMPORARY TABLE IF EXISTS hash_board;
DROP TEMPORARY TABLE IF EXISTS hash_card;
DROP TEMPORARY TABLE IF EXISTS tcc;
SET SQL_SAFE_UPDATES = 1;
SELECT * FROM opendesign.design WHERE uid=@NEW_DESIGN_ID`

  const forkDesign = () => {
    return new Promise((resolve, reject)=>{
      connection.query(sql, (err, result)=>{
        if(!err && result.length >= 42){
          resolve(result[42].uid);
          // console.log("!!!",result[42]);
        } else {
          // console.log("ERROR:",err)
          reject(err)
        }
      })
    })
  }
  
  // . select parent design
  // . store design
  // . copy new child design from parent design 
  // . update parent design
  // . modify new child deisgn
  // . is_project check and then create createboard, card, 
    


  forkDesign()
    .then(uid=>respond(uid))
    .catch(err=>reject(err))
};
