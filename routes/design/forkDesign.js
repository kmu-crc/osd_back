const connection = require("../../configs/connection");
const { updateTitle, createCard } = require("./designCard");
const { isOnlyEmail } = require("../../middlewares/verifications");

// design
exports.forkDesign = async (req, res, next) => {
  const parent = req.params.id;
  const user_id = req.params.user_id;

  const respond = (data) => {
    res.status(200).json({ success: true, new_design_id: data[0].uid, message: "파생디자인이 성공적으로 등록되었습니다." });
  };
  const reject = () => {
    res.status(200).json({ success: false, message: "파생디자인 생성에 실패하였습니다." });
  };

  let sql = `
    SET @PREFIX_STRING = '';
    SET @PARENT_DESIGN = ${parent};
    SET @USER_ID = ${user_id};
    SET SQL_SAFE_UPDATES = 0;
    DROP TEMPORARY TABLE IF EXISTS t;
    CREATE TEMPORARY TABLE IF NOT EXISTS t AS (SELECT NULL as uid, @USER_ID as user_id, title, explanation, thumbnail, category_level1, category_level2, category_level3, is_commercial, is_public, is_modify, is_problem, is_display_creater, @PARENT_DESIGN AS parent_design, NOW() AS create_time, NOW() AS update_time, is_project, is_members, d_flag FROM opendesign.design  WHERE uid = @PARENT_DESIGN);
    INSERT INTO opendesign.thumbnail SELECT NULL AS uid, @USER_ID AS user_id, s_img, m_img, l_img FROM opendesign.thumbnail WHERE uid IN (SELECT thumbnail FROM t) AND s_img IS NOT NULL;
    UPDATE t SET thumbnail = (SELECT @@IDENTITY) WHERE (SELECT thumbnail from opendesign.design WHERE uid=@PARENT_DESIGN)is not null;
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
    SELECT * FROM opendesign.design WHERE uid=@NEW_DESIGN_ID;`;

  const forkDesign = () => {
    return new Promise(async (resolve, reject) => {
      await connection.query(sql, (err, result) => {
        if (!err && result.length >= 42) {
          resolve(result[42])
        } else {
          reject(err)
        }
      })
    })
  }

  // const fn = () => {
  forkDesign()
    .then(data => respond(data))
    .catch(err => reject(err))
  // }

  // setTimeout(fn, 0)
};

exports.forkDesign2 = async (req, res, next) => {
  const parent = req.params.id;
  const user_id = req.params.user_id;

  function cloneDesignDB(parent) {
    return new Promise((resolve, reject) => {
      const sql = `
      INSERT INTO opendesign.design(user_id, title, explanation, parent_design, category_level1, category_level2, category_level3, is_commercial, is_public, is_modify, is_problem, is_display_creater, is_project)
      SELECT ${user_id} AS user_id, title, explanation, ${parent} as parent_design, category_level1, category_level2, category_level3, is_commercial, is_public, is_modify, ${false}, is_display_creater, is_project
      FROM opendesign.design
      WHERE uid = ${parent};
      `;
      connection.query(sql, (err, row) => {
        if (!err) {
          // console.log("new design id:", row.insertId);
          resolve(row.insertId);
        }
        else {
          reject(err);
        }
      })
    })
  }
  function updateDesignDB(id, values) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE opendesign.design SET ? WHERE uid = ${id}`;
      connection.query(sql, values, (err, row) => {
        if (!err) {

        } else {
          reject(err);
        }
      });
    })
  }
  function cloneThumbnailDB(parent, user_id) {
    return new Promise((resolve, reject) => {
      const sql = `
      INSERT INTO opendesign.thumbnail(user_id, s_img, m_img, l_img)
      SELECT ${user_id} AS user_id, s_img, m_img, l_img
      FROM opendesign.thumbnail
      WHERE uid IN (SELECT thumbnail FROM opendesign.design WHERE uid=${parent})`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row.insertId);
        }
        else {
          console.error('fork-design > clone thumbnail :', err);
          reject(err);
        }
      })
    })
  }
  function cloneBoardDB(parent, child, user_id) {
    return new Promise((resolve, reject) => {
      // uid, user_id, design_id, title, order, create_time, update_time, d_flag
      const sql = `
        INSERT INTO 
          opendesign.design_board (user_id, design_id, title, \`order\`)
        SELECT 
          ${user_id} AS user_id, ${child} AS design_id, title, \`order\`
        FROM 
          opendesign.design_board
        WHERE 
          design_id = ${parent};
      `;
      // console.log(sql);
      connection.query(sql, (err, _) => {
        if (!err) {
          resolve(child);
        } else {
          console.error(err);
          reject(err);
        }
      })
    })
  }
  function getBoardDB(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          * 
        FROM
          opendesign.design_board
        WHERE
          design_id = ${id}
        ORDER BY
          \`order\` ASC`;

      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          console.error(err);
          reject(err);
        }
      })
    })
  }
  function createMemberDB(child, user_id) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO opendesign.design_member(design_id, user_id, is_join, invited)
        VALUES (${child}, ${user_id}, 1, 0);
        `;
      connection.query(sql, (err, _) => {
        if (!err) {
          resolve(child);
        } else {
          console.error(err);
          reject(err);
        }
      })
    })
  }
  function createCountDB(child, parent) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO opendesign.design_counter(design_id, card_count)
        SELECT ${child} AS design_id, card_count
        FROM opendesign.design_counter
        WHERE design_id = ${parent}
        `;
      connection.query(sql, (err, _) => {
        if (!err) {
          resolve(child);
        } else {
          console.error(err);
          reject(err);
        }
      })
    })
  }
  function cloneCardDB(parent, child, child_id) {
    return new Promise((resolve) => {
      Promise.all(parent.map((step, index) => {
        return new Promise((resolve) => {
          const sql = `
            INSERT INTO opendesign.design_card (
              user_id, design_id, board_id, first_img, title, content, \`order\`, 
              is_complete_card, is_images, is_source, private)
            SELECT 
              ${user_id} AS user_id, ${child_id} AS design_id, ${child[index].uid} AS board_id, first_img,
              title, content, \`order\`, is_complete_card, is_images, is_source, private
            FROM opendesign.design_card
            WHERE board_id = ${step.uid}`;
          connection.query(sql, (err, row) => {
            if (!err) {
              resolve(true);
            }
            else {
              console.error(err);
            }
          });
        });
      }))
        .then(resolve(child[0].design_id))
        .catch(reject);
    })
  }
  function getCardDB(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          * 
        FROM
          opendesign.design_card
        WHERE
          design_id = ${id}
        ORDER BY
          board_id DESC, \`order\` ASC`;

      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          console.error(err);
          reject(err);
        }
      });
    });
  };
  function cloneContentDB(parent, child, child_id) {
    return new Promise((resolve, reject) => {
      Promise.all(parent.map((card, index) => {
        const sql = `
          INSERT INTO opendesign.design_content 
            (user_id, card_id, content, type, data_type, extension, \`order\`, file_name)
          SELECT 
            ${user_id} AS user_id, ${child[index].uid} AS card_id, content, type, data_type, extension, \`order\`, file_name 
          FROM opendesign.design_content
          WHERE card_id = ${card.uid}`;
        // console.log(sql);
        connection.query(sql, (err, _) => {
          if (!err) {
            resolve(true);
          } else {
            console.error(err);
          }
        });
      }))
        .then(resolve(child_id))
        .catch(reject);
    });
  }
  cloneDesignDB(parent)
    .then(async child => {
      updateDesignDB(child, { thumbnail: await cloneThumbnailDB(parent, user_id) });
      return child;
    })
    .then(child => createCountDB(child, parent))
    .then(child => createMemberDB(child, user_id))
    .then(child => cloneBoardDB(parent, child, user_id))
    .then(async child => cloneCardDB(await getBoardDB(parent), await getBoardDB(child), child))
    .then(async child => cloneContentDB(await getCardDB(parent), await getCardDB(child), child))
    .then(newDesignId => res.status(200).json({ success: true, new_design_id: newDesignId, message: "파생디자인이 성공적으로 등록되었습니다." }))
    .catch(err => res.status(200).json({ data: "failed: " + err }));
}

exports.getForkDesignList = (req, res, next) => {
  const designId = req.params.id;

  function getChildDesign(id) {
    // console.log("ID", id)
    return new Promise((resolve, reject) => {
      connection.query(
        // `SELECT * FROM opendesign.design WHERE design.parent_design=${id}`, (err, row) => {
        `SELECT 
        D.uid, D.user_id, D.title, D.explanation, 
        U.nick_name,
        T.m_img , T.s_img,
        TT.m_img AS 'p_m_img', TT.s_img AS 'p_s_img'
        
        FROM opendesign.design D
        
        LEFT JOIN opendesign.user U ON D.user_id = U.uid
        LEFT JOIN opendesign.thumbnail T ON U.thumbnail = T.uid 
        LEFT JOIN opendesign.thumbnail TT ON D.thumbnail = TT.uid
        
        WHERE D.parent_design = ${id};`, (err, row) => {
        if (!err) {
          if (row[0].length === 0) {
            res.status(200).json({ success: false, message: `파생디자인목록 조회실패: 이 디자인을 파생한 디자인이 없습니다.` });
          }
          else {
            // console.log(row[0])
            res.status(200).json({ success: true, message: `파생디자인목록 조회성공`, list: row })
          }
        } else {
          const msg = `파생디자인목록 조회실패:` + err
          res.status(200).json(msg);
        }
      }
      )
    })
  }
  getChildDesign(designId)
}
