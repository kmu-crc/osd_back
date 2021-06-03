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
//get seles
exports.GetMySales = (req, res, next) => {
    const user_id = req.decoded.uid;
    const page = req.params.page;

    console.log("this!!!");
    const getPayment = () => {
        return new Promise((resolve, reject) => {
            const sql =
                `SELECT P.uid, P.user_id AS \`buy_id\`,P.item_id,P.payment_detail,P.payment_title,
                P.payment_price AS \`price\`, P.create_time,U.nick_name,T.s_img 
                FROM market.payment P
                LEFT JOIN market.item I ON I.uid = P.item_id
                LEFT JOIN market.user U ON U.uid = P.user_id
                LEFT JOIN market.thumbnail T ON T.uid = U.thumbnail
                WHERE I.user_id=${user_id}
                ORDER BY P.create_time DESC
                LIMIT ${page * 10}, 10`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    console.log(row);
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    };


    // const getItemInfo = payment => {
    //     return new Promise((resolve, reject) => {
    //         const sql =
    //             `SELECT I.*, T.m_img as "thumbnail" FROM market.item I 
    //             LEFT JOIN market.user U ON U.uid = I.user_id 
    //             LEFT JOIN market.thumbnail T ON U.thumbnail = T.uid
    //             WHERE I.uid = ${payment.item_id}`;
    //         connection.query(sql, (err, row) => {
    //             if (!err) {
    //                 resolve(row[0]);
    //             } else {
    //                 reject(err);
    //             }
    //         });
    //     })
    // };
    // const getAllItemInfo = payments => {
    //     return new Promise((resolve, reject) => {
    //         Promise.all(
    //             payments.map(async item => {
    //                 item = { ...item, ...await getItemInfo(item) };
    //                 item.title = item.title || item.payment_title || "의뢰상품";
    //                 return item;
    //             })
    //         )
    //             .then(list => resolve(list))
    //             .catch(err => reject(err));
    //     })
    // };
    const getTotalCount = () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*)
            FROM market.payment P
            LEFT JOIN market.item I ON I.uid = P.item_id
            LEFT JOIN market.user U ON U.uid = P.user_id
            LEFT JOIN market.thumbnail T ON T.uid = U.thumbnail
            WHERE I.user_id=${user_id}
            ORDER BY P.create_time DESC`;
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
        console.log("?");
        return new Promise((resolve, reject) => {
            const sql =
                `SELECT 
                    Q.uid AS 'payment_id', Q.user_id, Q.item_id, Q.payment_detail, Q.payment_title,Q.response_id, Q.payment_price AS 'price', Q.create_time,
                    U.nick_name,D.type
                FROM market.payment Q
                    LEFT JOIN market.user U ON U.uid = Q.user_id 
                    LEFT JOIN market.item_detail D ON Q.\`item_id\`=D.item_id
                WHERE Q.user_id = ${user_id} AND Q.item_id
                ORDER BY create_time DESC
                LIMIT ${page * 6}, 6`;//AND Q.review_id IS NULL 
            connection.query(sql, (err, row) => {
                if (!err) {
                    console.log(row);
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
                    Q.uid AS 'payment_id', Q.user_id, Q.item_id, Q.payment_detail, Q.payment_title,Q.response_id, Q.payment_price AS 'price', Q.create_time,
                    U.nick_name, true AS 'custom', Q.confirm AS isPurchased
                FROM market.payment Q
                    LEFT JOIN market.user U ON U.uid = Q.user_id 
                WHERE Q.user_id=${user_id} AND Q.item_id IS NULL 
                ORDER BY create_time DESC
                LIMIT ${page * 6}, 6`;
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
exports.CreatePayment = async (req, res, next) => {
    const { NewAlarm } = require("../../socket");

    const id = req.params.id === "custom" ? null : parseInt(req.params.id, 10);
    const user_id = req.decoded.uid;
    const _ = req.body;

    const copyItemList = (payment_id) => {
		return new Promise((resolve, reject) => {
// mysql executor
const conversion = raw => JSON.parse(JSON.stringify(raw));
const executor = sql => new Promise((resolve, reject) => connection.query(sql, (E, R) => E ? reject(E) : resolve(conversion(R))));
const executor2 = (sql, obj) => new Promise((resolve, reject) => connection.query(sql, obj, (E, R) => E ? reject(E) : resolve(conversion(R))));
	// get list header
	const getList = () =>
		new Promise(async (resolve, reject) => {
	
			const headers = await executor(`SELECT * FROM market.list_header H WHERE H.type="practice" AND H.content_id = ${id};`);
			const lists = await executor(`SELECT * FROM market.list WHERE list_header_id IN (${headers.length > 0 ? headers.map(head => head.uid).join(","):"null"});`);
			const cards = await executor(`SELECT * FROM market.card WHERE list_id IN (${lists.length > 0 ? lists.map(list => list.uid).join(",") : "null"});`);
			const contents = await executor(`SELECT * FROM market.content WHERE card_id IN (${cards.length > 0 ? cards.map(card => card.uid).join(","):"null"});`);
			resolve({ headers, lists, cards, contents });
		});

const copyList = (rows) =>
    new Promise((resolve, reject) => {
        const { headers, lists, cards, contents } = rows;

        const copyHeader = headers.map(head => 
			new Promise(async (resolve) => {
				const newobj = { 
					"name": head.name, 
					"type": "copied", 
					"content_id": payment_id, 
					"editor_type": head.editor_type 
				}; 
				const r = await executor2("INSERT INTO market.list_header SET ?;", newobj); 
				resolve({ "origin": head.uid, "new": r.insertId });
			}));

	Promise.all(copyHeader)
		.then(mHeader => {
			const copyList = lists.map(list => 
				new Promise(async (resolve) => { 
					const newobj = { 
						"list_header_id": mHeader.filter(head => head.origin === list.list_header_id)[0].new, 
						"type": list.type, 
						"user_id": user_id, 
						"content_id": payment_id, 
						"title": list.title, 
						"order": list.order, 
					}; 
					const r = await executor2("INSERT INTO market.list SET ?;", newobj); 
					resolve({ "origin": list.uid, "new": r.insertId });
            })
        );

	Promise.all(copyList)
		.then(mList => {
        	const copyCard = cards.map(card => 
				new Promise(async (resolve) => { 
					const newobj = { 
						"user_id": user_id,
						"list_id": mList.filter(list => list.origin === card.list_id)[0].new, 
						"order": card.order, 
						"thumbnail": card.thumnail,
						"title": card.title,
						"description": card.description,
						"private": card.private,
					};
					const r = await executor2("INSERT INTO market.card SET ?;", newobj);
					resolve({ "origin": card.uid, "new": r.insertId });
            })
        );

	Promise.all(copyCard)
		.then(mCard => {
        	contents.map(async content => { 
				const newobj = { 
					"user_id": user_id,
					 "card_id": mCard.filter(card => card.origin === content.card_id)[0].new, 
					"content": content.content, 
					"content_type": content.content_type,
					"data_type": content.data_type,
					"extension": content.extension,
					"order": content.order,
					"file_name": content.file_name,
					"private": content.private, 
				}; 
				await executor2("INSERT INTO market.content SET ?;", newobj); })
                });
            });
        });
        resolve(true);
    });

		getList()
			.then(rows => rows.headers.length > 0 ? copyList(rows) : null)
			.then(()   => resolve(payment_id))
		});
    }

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
					console.log("create payment :",row.insertId);
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
            // console.log(sql);
            connection.query(sql, (err, row) => {
                if (!err) {
					console.log("minus point");
                    resolve(id);
                } else {
                    console.error(err);
                    reject(err);
                }
            });
        });
    };
    const getExpertIdByItemId = itemid => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT user_id FROM market.item WHERE uid=${itemid}`;
            // console.log(sql, itemid);
            connection.query(sql, itemid, (err, row) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve((row[0] && row[0]["user_id"]) || null);
                }
            });
        });
    };
    const success = data => { res.status(200).json({ success: true, data: data }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    const expert_id = await getExpertIdByItemId(id);

    createPayment(id)
        .then(minusPoint)
        // .then(checkCompletedRequest)
        .then(copyItemList)
        .then(success)
        //.then(NewAlarm({ type: "ITEM_PURCHASED_TO_USER", from: expert_id, to: user_id, item_id: id, })) // to buyer
        //.then(NewAlarm({ type: "ITEM_PURCHASED_TO_EXPERT", from: user_id, to: expert_id, item_id: id, })) // to seller
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
            // console.log(sql);
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
