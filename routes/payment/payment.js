const connection = require("../../configs/connection");


// Get Payment
exports.GetPayment = (req, res, next) => {
    const item_id = req.params.id;
    const user_id = req.decoded.uid;
    const page = req.params.page;

    const getPayment = () => {
        return new Promise((resolve, reject) => {
            const sql =
                `SELECT 
                    Q.uid, Q.user_id, Q.item_id, Q.payment_detail, Q.payment_price, Q.create_time,
                    U.nick_name
                FROM market.payment Q
                    LEFT JOIN market.user U ON U.uid=Q.user_id 
                WHERE Q.user_id=${user_id} AND Q.item_id=${item_id} AND Q.review_id IS NULL
                ORDER BY create_time DESC
                LIMIT ${page * 10}, 10`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    };
    const getTotalCount = () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) AS 'total' FROM market.payment Q WHERE Q.item_id=${item_id};`;
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
    getPayment()
        .then(payments => {
            data = { payments: payments };
            return getTotalCount();
        })
        .then(total => {
            data = { ...data, total: total };
            return data;
        })
        .then(success)
        .catch(failure);
};

// Get My Payment
exports.GetMyPayment = (req, res, next) => {
    const user_id = req.decoded.uid;
    const page = req.params.page;

    const getPayment = () => {
        return new Promise((resolve, reject) => {
            const sql =
                `SELECT 
                    Q.uid AS 'payment_id', Q.user_id, Q.item_id, Q.payment_detail, Q.payment_title, Q.payment_price AS 'price', Q.create_time,
                    U.nick_name
                FROM market.payment Q
                    LEFT JOIN market.user U ON U.uid = Q.user_id 
                WHERE Q.user_id = ${user_id} AND Q.review_id IS NULL AND Q.item_id
                ORDER BY create_time DESC
                LIMIT ${page * 10}, 10`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    };

    const getItemInfo = payment => {
        return new Promise((resolve, reject) => {
            const sql =
                `SELECT I.*, U.nick_name, T.m_img as "thumbnail" FROM market.item I 
                LEFT JOIN market.user U ON U.uid = I.user_id 
                LEFT JOIN market.thumbnail T ON I.thumbnail_id = T.uid
                WHERE I.uid = ${payment.item_id}`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row[0]);
                } else {
                    reject(err);
                }
            });
        })
    };
    const getAllItemInfo = payments => {
        return new Promise((resolve, reject) => {
            Promise.all(
                payments.map(async item => {
                    item = { ...item, ...await getItemInfo(item) };
                    item.title = item.title || item.payment_title || "의뢰상품";
                    return item;
                })
            )
                .then(list => resolve(list))
                .catch(err => reject(err));
        })
    };
    const getTotalCount = () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) AS 'total' FROM market.payment Q WHERE Q.user_id=${user_id} AND Q.review_id IS NULL;`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row[0]["total"]);
                } else {
                    console.log(err);
                    reject(err);
                }
            });
        });
    };

    const success = data => { res.status(200).json({ success: true, data: data }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    let data = null;
    getPayment()
        .then(getAllItemInfo)
        .then(payments => {
            data = { payments: payments };
            return getTotalCount();
        })
        .then(total => {
            data = { ...data, total: total };
            return data;
        })
        .then(success)
        .catch(failure);

};

// Get My requested and purchased Item by me
exports.GetMyRequestItem = (req, res, next) => {
    const user_id = req.decoded.uid;
    const page = req.params.page;

    const getRequestItem = () => {
        return new Promise((resolve, reject) => {
            const sql =
                `SELECT 
                    Q.uid AS 'payment_id', Q.user_id, Q.item_id, Q.payment_detail, Q.payment_title, Q.payment_price AS 'price', Q.create_time,
                    U.nick_name, true AS 'custom', Q.confirm AS isPurchased
                FROM market.payment Q
                    LEFT JOIN market.user U ON U.uid = Q.user_id 
                WHERE Q.user_id=${user_id} AND Q.item_id IS NULL 
                ORDER BY create_time DESC
                LIMIT ${page * 10}, 10`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    };

    const getItemInfo = requestItem => {
        return new Promise((resolve, reject) => {
            const sql =
                `SELECT I.*, U.nick_name, T.m_img as "thumbnail" FROM market.item I 
                LEFT JOIN market.user U ON U.uid = I.user_id 
                LEFT JOIN market.thumbnail T ON I.thumbnail_id = T.uid
                WHERE I.uid = ${requestItem.item_id}`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row[0]);
                } else {
                    reject(err);
                }
            });
        })
    };
    const getAllItemInfo = requestItems => {
        return new Promise((resolve, reject) => {
            Promise.all(
                requestItems.map(async item => {
                    item = { ...item, ...await getItemInfo(item) };
                    item.title = item.title || item.payment_title || "의뢰상품";
                    return item;
                })
            )
                .then(list => resolve(list))
                .catch(err => reject(err));
        })
    };
    const getTotalCount = () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) AS 'total' FROM market.payment Q WHERE Q.user_id=${user_id} AND Q.review_id IS NULL;`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row[0]["total"]);
                } else {
                    console.log(err);
                    reject(err);
                }
            });
        });
    };

    const success = data => { res.status(200).json({ success: true, data: data }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    let data = null;
    getRequestItem()
        .then(getAllItemInfo)
        .then(requestItems => {
            data = { requestItems: requestItems };
            return getTotalCount();
        })
        .then(total => {
            data = { ...data, total: total };
            return data;
        })
        .then(success)
        .catch(failure);

};
// Delete Payment
exports.RemovePayment = (req, res, next) => {
    const id = parseInt(req.params.id, 10);

    const removePayment = id => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM market.payment WHERE uid=${id}`;
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

    removePayment(id)
        .then(success)
        .catch(failure);
};

// Create Payment
exports.CreatePayment = (req, res, next) => {
    const id = req.params.id === "custom" ? null : parseInt(req.params.id, 10);
    const user_id = req.decoded.uid;
    const _ = req.body;

    const createPayment = id => {
        return new Promise((resolve, reject) => {
            let data = {
                user_id: user_id,
                item_id: id,
                payment_title: _.payment_title,
                payment_detail: JSON.stringify(_.payment_detail),
                payment_price: _.payment_price,
            };
            if (_.response_id) {
                data.response_id = _.response_id;
            }
            const sql = `INSERT INTO market.payment SET ?`;
            connection.query(sql, data, (err, row) => {
                if (!err) {
                    resolve(row.insertId);
                } else {
                    console.error(err);
                    reject(err);
                }
            });
        });
    };
    const minusPoint = (id) => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE market.user SET point=point-${_.payment_price} WHERE uid=${user_id}`;
            console.log(sql);
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(id);
                } else {
                    console.error(err);
                    reject(err);
                }
            });
        });
    };
    // const checkCompletedRequest = (id) => {
    //     return new Promise((resolve, reject) => {
    //         if (_.request_id) {
    //             const sql = `UPDATE market.request SET expert_id=${id} WHERE uid=${_.request_id}`;
    //             connection.query(sql, (err, row) => {
    //                 if (!err) {
    //                     resolve(id);
    //                 } else {
    //                     reject(err);
    //                 }
    //             });
    //         } else {
    //             resolve(id);
    //         }
    //     });
    // };

    const success = data => { res.status(200).json({ success: true, data: data }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    createPayment(id)
        .then(minusPoint)
        // .then(checkCompletedRequest)
        .then(success)
        .catch(failure);
};


exports.GetThisItemPurchased = (req, res, next) => {
    const request_id = req.params.id;

    const isPurchased = () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) FROM market.payment P WHERE P.confirm=0 AND P.response_id=${request_id}`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row[0] && row[0]["COUNT(*)"] > 0 ? true : false);
                } else {
                    reject(err);
                }
            });
        });
    };

    const success = data => { res.status(200).json({ success: true, data: data }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    isPurchased()
        .then(success)
        .catch(failure);
};

exports.ConfirmThisItemPurchased = (req, res, next) => {
    const id = req.params.id;
    // const user_id = req.decoded.uid;

    const confirm = () => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE market.payment SET confirm = 1 WHERE uid = ${id}`;
            console.log(sql);
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(id);
                } else {
                    reject(err);
                }
            });
        });
    };
    const completedRequest = (id) => {
        return new Promise((resolve, reject) => {
            if (id) {
                const sql =
                    `UPDATE market.request R, (SELECT group_id FROM market.request WHERE uid  IN (SELECT response_id FROM market.payment WHERE uid=${id})) AS T
                        SET completed=1
                     WHERE R.group_id = T.group_id;`;
                connection.query(sql, (err, row) => {
                    if (!err && row) {
                        resolve(id);
                    } else {
                        reject(err);
                    }
                });
            } else {
                resolve(id);
            }
        });
    };

    const success = (id) => { res.status(200).json({ success: true, data: id }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    confirm()
        .then(completedRequest)
        .then(success)
        .catch(failure);
};