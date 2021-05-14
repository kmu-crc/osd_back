const connection = require("../../configs/connection");
// const { getItemReview, itemReviewDelete, itemReviewCreate } = require("./itemReview");

// Get Reviews
exports.GetReview = (req, res, next) => {
    const id = req.params.id;
    const page = req.params.page;

    const getReview = id => {
        return new Promise((resolve, reject) => {
            const sql =
                `SELECT 
                    Q.*,
                    U.nick_name, T.m_img,I.title
                FROM market.review Q
                    LEFT JOIN market.user U ON U.uid = Q.user_id 
                    LEFT JOIN market.thumbnail T ON T.uid IN (SELECT thumbnail_id FROM market.item WHERE uid=Q.item_id)
                    LEFT JOIN market.item I ON Q.item_id=I.uid
                WHERE Q.item_id=${id}
                ORDER BY group_id DESC, sort_in_group ASC
                LIMIT ${page * 4}, 4`;

            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    };
    const getTotalCount = id => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) AS 'total' FROM market.review Q WHERE Q.item_id=${id};`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row[0]["total"]);
                } else {
                    reject(err);
                }
            });
        });
    };
    const getTotalScore = id => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT AVG(score) AS 'score' FROM market.review Q WHERE Q.item_id=${id};`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row[0]["score"]);
                } else {
                    reject(err);
                }
            });
        });
    };
    const success = data => { res.status(200).json({ success: true, data: data }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    let data = null;
    getReview(id)
        .then(reviews => {
            data = { reviews: reviews };
            return getTotalScore(id);
        })
        .then(score => {
            data = { ...data, score: score };
            return getTotalCount(id);
        })
        .then(total => {
            data = { ...data, total: total };
            return data;
        })
        .then(success)
        .catch(failure);
};

// Delete Reviews
exports.RemoveReview = (req, res, next) => {
    const id = parseInt(req.params.id, 10);

    const removeReview = id => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM market.review WHERE uid=${id}`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    };

    const success = data => { res.status(200).json({ success: true, data: { ...data } }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    removeReview(id)
        .then(success)
        .catch(failure);
};

// Create Reviews
exports.CreateReview = (req, res, next) => {
    const { NewAlarm } = require("../../socket");

    const id = parseInt(req.params.id, 10);
    const user_id = req.decoded.uid;
    const _ = req.body;
    console.log("-----",_);
    const updateSortForDESC = id => {
        // 1.UPDATE BOARD SET SORTS = SORTS + 1 
        // WHERE BGROUP =  (원글의 BGROUP)  AND SORTS >(원글의 SORTS)
        return new Promise((resolve, reject) => {
            if (_.group_id == null) resolve(id);
            const sql = `UPDATE market.review SET sort_in_group = sort_in_group + 1
                         WHERE group_id=${_.group_id} AND sort_in_group>${_.sort_in_group}`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(id);
                } else {
                    reject(err);
                }
            });
        });
    }
    const createAnswer = id => {
        console.log("create review", _);
        // 2. INSERT INTO BOARD VALUES (번호, (원글의 BGROUP), (원글의 SORTS +1), (원글의 DEPTH +1) ,' 제목')
        return new Promise((resolve, reject) => {
            const data = { group_id: _.group_id, sort_in_group: _.sort_in_group + 1, user_id: user_id, item_id: id, comment: _.comment };
            const sql = `INSERT INTO market.review SET ?`;
            connection.query(sql, data, (err, row) => {
                if (!err) {
                    console.log(sql, row)
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    };
    const createReview = id => {
        return new Promise((resolve, reject) => {
            console.log(_.thumbnail);
            const data = { score: _.score, group_id: _.group_id, sort_in_group: 0
                , user_id: user_id, item_id: id, comment: _.comment,
                thumbnail:_.thumbnail};
            const sql = `INSERT INTO market.review SET ?`;
            connection.query(sql, data, (err, row) => {
                if (!err) {
                    resolve(row.insertId);
                } else {
                    reject(err);
                }
            });
        });
    };
    const giveGroupId = id => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE market.review SET group_id=${id} WHERE uid=${id}`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(id);
                } else {
                    reject(err);
                }
            });
        });
    };
    const giveReviewIdToPayment = id => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE market.payment SET review_id=${id} WHERE uid=${_.payment_id}`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(true);
                } else {
                    reject(err);
                }
            });
        });
    }

    const getOwner = () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT user_id AS owner FROM market.item WHERE uid=${id}`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    console.log("question!!!!!",user_id,row[0].owner,id)

                    resolve(row[0]);
                } else {
                    reject(err);
                }
            });
        });
    };

    const success = data => { res.status(200).json({ success: true, data: data }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    // answer
    if (_.group_id) {
        updateSortForDESC(id)
            .then(createAnswer)
            .then(success)
            .catch(failure);
    }
    // review
    else {
        createReview(id)
            .then(giveGroupId)
            .then(giveReviewIdToPayment)
            .then(success)
            .then(getOwner)
            .then(data=>NewAlarm({ type: "ITEM_REVIEW_TO_OWNER", from: user_id, to: data.owner, item_id: id, })) // to buyer
            .catch(failure);
    }
};
