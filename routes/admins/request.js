const connection = require("../../configs/connection");

exports.RequestList = (req, _, next) => {
    console.log("params:", req.params);

    const { page, max, type, keyword } = req.params;
    const cate1 = (req.params.cate1 === 'undefined' || req.params.cate1 === 'null' || req.params.cate1 === '0') ? null : req.params.cate1;
    const cate2 = (req.params.cate2 === 'undefined' || req.params.cate2 === 'null' || req.params.cate1 === '0') ? null : req.params.cate2;
    const sort = (req.params.sort === 'undefined' || req.params.sort === 'null') ? 'update' : req.params.sort;
    const desc = req.params.desc;
    const start = req.params.start;
    const end = req.params.end;
    const keywords = (keyword === "null" || keyword == null) ? [] : keyword.trim().split(" ");

    let conditions = [];
    // category
    if (cate1 !== null) {
        conditions.push(`Q.category_level1 LIKE ${cate1}`);

        if (cate2 === null) {
            conditions.push(`Q.category_level1 LIKE ${cate1}`);
        } else {
            conditions.push(`Q.category_level2 LIKE ${cate2}`);
        }
    }
    // keyword
    if (keywords.length !== 0) {
        keywords.map(word =>
            conditions.push(`Q.title LIKE "%${word}%"`));
    }

    // dates
    if (start !== "null" && end !== "null") {
        if (sort === `create`) {
            conditions.push(`Q.create_time BETWEEN '${start}' AND '${end}'`);
        } else {
            conditions.push(`Q.update_time BETWEEN '${start}' AND '${end}'`);
        }
    }

    const sql = `
      SELECT
        *
      FROM
        market.request Q

      WHERE
        ${type === "null" ?
            `` : `Q.type LIKE '${type}' AND`}

        ${conditions.length > 0
            ? conditions.map(cond => cond).join(" AND ") : ""}

      ORDER BY
        Q.group_id ${sort === 'update' ? 'DESC' : 'ASC'}, Q.sort_in_group ASC,

        ${sort === "create" ?
            "Q.create_time" : sort === "update" ?
                "Q.update_time" : "Q.nick_name"}

        ${desc === "desc" ?
            "DESC" : "ASC"}

      LIMIT 
        ${max * page}, ${max};
    `;

    console.log(sql);
    req.sql = sql;
    next();
};

exports.RequestListCount = (req, res, _) => {
    const { page, max, cate1, cate2, sort, desc, start, end, keyword } = req.params;
    const keywords = (keyword === "null" || keyword == null) ? [] : keyword.trim().split(" ");

    let options = [];
    // cates
    if (parseInt(cate1, 10) !== 0) {
        if (parseInt(cate2, 10) === 0) {
            options.push(`E.category_level1 LIKE ${cate1}`);
        }
        else {
            options.push(`E.category_level2 LIKE ${cate2}`);
        }
    }
    // keyword
    if (keywords.length !== 0) {
        keywords.map(word =>
            options.push(`U.nick_name LIKE "%${word}%"`))
    }
    // dates
    if (start !== "null" && end !== "null") {
        if (sort === `create`) {
            options.push(`E.create_time BETWEEN '${start}' AND '${end}'`);
        } else {
            options.push(`E.update_time BETWEEN '${start}' AND '${end}'`);
        }
    }

    const WHERE = `
        WHERE E.\`type\` LIKE 'maker' 
        ${options.length > 0
            ? "AND " : ""}
           ${options.length > 0
            ? options.map(opt => opt).join(" AND ") : ""}
    `;

    // LEFT JOIN
    // market.user_detail UD ON UD.user_id = U.uid
    let sql = `
        SELECT
           COUNT(*) AS 'cnt' 
        FROM
            market.expert E
        LEFT JOIN
            market.user U ON U.uid = E.user_id
        ${WHERE}
    `;

    const getCount = () => {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, result) => {
                if (!err && result.length) {
                    resolve(result[0]);
                } else {
                    console.log(err);
                    reject(err);
                }
            })
        })
    }

    getCount()
        .then(num => res.status(200).json(num))
        .catch(err => res.status(500).json(err))
}

exports.DeleteRequest = (req, res, _) => {
    const id = req.params.id;
    const deleteMaker = () => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM market.request WHERE uid = ${id}`;
            connection.query(sql, (err, _) => {
                if (err) {
                    console.error("DELETE DESIGN ERROR:", err);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }
    const success = () => {
        res.status(200).json({ success: true });
    }
    const error = (err) => {
        res.status(500).json({ success: false, message: err });
    }
    deleteMaker()
        .then(success)
        .catch(error);
}




// GET REQUEST
exports.GetRequest = (req, res, next) => {
    const type = req.params.type;

    const getRequest = () => {
        return new Promise((resolve, reject) => {
            const sql = req.sql;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    };
    const getUserName = request => {
        return new Promise((resolve, reject) => {
            const sql =
                (request.sort_in_group === 0)
                    ? `SELECT nick_name FROM market.user WHERE uid = ${request.client_id} `
                    : `SELECT nick_name FROM market.user WHERE uid = ${request.expert_id} `;
            connection.query(sql, (err, row) => {
                if (!err && row) {
                    resolve(row[0] ? row[0]["nick_name"] : null);
                }
                else
                    reject(err);
            });
        });
    };
    const getUserThumbnail = request => {
        return new Promise((resolve, reject) => {
            const sql =
                (request.sort_in_group === 0)
                    ? `SELECT T.s_img as imgURL FROM market.thumbnail T
            LEFT JOIN market.user U ON U.thumbnail = T.uid
            WHERE U.uid = ${request.client_id} `
                    : `SELECT T.s_img as imgURL FROM market.thumbnail T
            LEFT JOIN market.user U ON U.thumbnail = T.uid
            WHERE U.uid = ${request.expert_id} `;
            connection.query(sql, (err, row) => {
                if (!err && row) {
                    resolve(row[0] ? row[0]["imgURL"] : null);
                }
                else
                    reject(err);
            });
        });
    }
    const getAllUserName = requests => {
        return new Promise((resolve, reject) => {
            Promise.all(
                requests.map(async item => {
                    item.nick_name = await getUserName(item);
                    return item;
                }))
                .then(list => {
                    resolve(list)
                })
                .catch(err => reject(err))
        })
    }
    const getAllUserThumbnail = requests => {
        return new Promise((resolve, reject) => {
            Promise.all(
                requests.map(async item => {
                    item.imgURL = await getUserThumbnail(item);
                    return item;
                }))
                .then(list => {
                    resolve(list)
                })
                .catch(err => reject(err))
        })
    }
    const getTotalCount = () => {
        return new Promise((resolve, reject) => {
            const sql =
                `SELECT COUNT(*) AS 'total' FROM market.request Q
                    WHERE Q.type = "${type}" AND Q.completed NOT LIKE 1`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row[0]["total"]);
                } else {
                    reject(err);
                }
            });
        });
    };

    const success = data => { res.status(200).json({ success: true, data: data }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    let data = null;
    getRequest()
        .then(getAllUserName)
        .then(getAllUserThumbnail)
        .then(requests => {
            data = { requests: requests };
            return getTotalCount();
        })
        .then(total => {
            data = { ...data, total: total };
            return data;
        })
        .then(success)
        .catch(failure);
};
