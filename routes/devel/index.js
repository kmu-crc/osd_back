const express = require("express");
const axios = require("axios");
const router = express.Router();
const auth = require("../../middlewares/auth");
var connection = require("../../configs/connection");

// mysql executor
const conversion = raw => JSON.parse(JSON.stringify(raw));
const executor = sql => new Promise((resolve, reject) => connection.query(sql, (E, R) => E ? reject(E) : resolve(conversion(R))));
const executor2 = (sql, obj) => new Promise((resolve, reject) => connection.query(sql, obj, (E, R) => E ? reject(E) : resolve(conversion(R))));

// routers
router.post("/test/:id",auth, (req, res, next) => {
	const user_id = req.decoded.uid;
	const item_id = req.body.item;
	const payment_id = req.body.payment;

	// get list header
	const getList = () =>
		new Promise(async (resolve, reject) => {
	
			const headers = await executor(`SELECT * FROM market.list_header H WHERE H.type="practice" AND H.content_id = ${item_id};`);
			const lists = await executor(`SELECT * FROM market.list WHERE list_header_id IN (${headers.map(head => head.uid).join(",")});`);
			const cards = await executor(`SELECT * FROM market.card WHERE list_id IN (${lists.map(list => list.uid).join(",")});`);
			const contents = await executor(`SELECT * FROM market.content WHERE card_id IN (${cards.map(card => card.uid).join(",")});`);
	
			resolve({ headers, lists, cards, contents });
		});

const copyList = (rows) =>
	new Promise((resolve, reject) => {

		const { headers, lists, cards, contents } = rows;

		const copyHeader =  headers.map(head => { return new Promise(async (resolve)=>{ const newobj = { "name": head.name, "type": "copied", "content_id": payment_id, "editor_type": head.editor_type }; const r = await executor2("INSERT INTO market.list_header SET ?;", newobj); resolve({ "origin": head.uid, "new": r.insertId }); }); });

		Promise.all(copyHeader)
		.then(mHeader => {
		const copyList =  lists.map(list=> { return new Promise(async (resolve)=>{ const newobj = { "list_header_id": mHeader.filter(head => head.origin === list.list_header_id)[0].new, "type": list.type, "user_id": user_id, "content_id": payment_id, "title": list.title, "order": list.order, }; const r = await executor2("INSERT INTO market.list SET ?;", newobj); resolve({ "origin": list.uid, "new": r.insertId });
			});
		});

			Promise.all(copyList)
				.then(mList => {

		const copyCard =  cards.map(card => { return new Promise(async (resolve)=>{ const newobj = { "user_id": user_id, "list_id": mList.filter(list => list.origin === card.list_id)[0].new, "order": card.order, "thumbnail": card.thumnail, "title": card.title, "description": card.description, "private": card.private, }; const r = await executor2("INSERT INTO market.card SET ?;", newobj); resolve({ "origin": card.uid, "new": r.insertId });
			});
		});

				Promise.all(copyCard)
					.then(mCard => {
					contents.map(async content => { const newobj = { "user_id": user_id, "card_id": mCard.filter(card => card.origin === content.card_id)[0].new, "content": content.content, "content_type": content.content_type, "data_type": content.data_type, "extension": content.extension, "order": content.order, "file_name": content.file_name, "private": content.private, }; await executor2("INSERT INTO market.content SET ?;", newobj); })
				});	
			});
		});
		resolve(rows);
	});

	getList()
		.then(copyList)
		.then(result => res.status(200).json({ success: true, data: result }))
		.catch(e => res.status(500).json({ success: false, deatil: e }));
});

router.post("/copy/:id", auth, (req, res, next) => {
	const user_id = req.decoded.uid;
	const item_id = req.params.id;
	const payment_id = -999;

	const getItemHeader = item_id => executor(`SELECT * FROM market.list_header H WHERE H.type = 'practice' AND H.content_id = ${item_id};`);

	const copyListHeader = (item_id) => {
		return new Promise(async (resolve, reject) => {
			const headers = await getItemHeader(item_id);
			console.log(headers);
			const newheaders = headers.map(head => {
				return ({name:head.name, type: "copied", content_id: payment_id, editor_type: head.editor_type });
			});
			const map = newheaders.map(async head => {
				const r = await executor(`INSERT INTO market.list_header(name, type, content_id, editor_type) VALUES (\"${head.name}\",\"${head.type}\",${head.content_id},\"${head.editor_type}\");`);
				console.log(r);
				return {1: r.insertId, 2:head.uid};
			});
			Promise.all(map).then(rst=>console.log(rst));
			resolve({newheaders,map});
				//.then(async headers => {
				//	const newIDs = await headers.map(async head => {
				//		header.push({ n: r.insertId, o: head.uid});
				//	});	
				//	Promise.all(newIDs).then(resolve(header));
				//});
		});
	}

	////get tree of lecture item 
    //const getTree = (id) =>

	//	new Promise(async(resolve, reject) => {

	//		const getItemList = head_id => executor(`SELECT * FROM market.list L WHERE L.list_header_id = ${head_id};`);
	//		const getItemCard = list_id => executor(`SELECT * FROM market.card C WHERE C.list_id = ${list_id};`);
	//		const getItemContent = card_id => executor(`SELECT * FROM market.content C WHERE C.card_id = ${card_id};`);

	//		const card = {uid:164};	
	//		
	//		const obj = await getItemContent(card.uid);
	//		let _= {};
	//		Promise.all(obj).then(data=>{
	//			_= data;	
	//			resolve(_);
	//		});
	//});

	//const copyTree = steps => new Promise((resolve, reject) => { ; });


	copyListHeader(item_id)
		.then(data => res.status(200).json({success:true,detail:data}))
		.catch(e => res.status(500).json({success:false,detail:e}));
});
router.get("/copy_item_list_sql_version/:id/:user_id", 
	(req, res, next) => {

const item_id = req.params.id;
const user_id = req.params.user_id; // req.decoded.uid; // in-the-future. 
const payment_id = -999;
	const sql = 
`
SET SQL_SAFE_UPDATES = 0;

DROP TEMPORARY TABLE IF EXISTS tLIST_HEADER;
CREATE TEMPORARY TABLE IF NOT EXISTS tLIST_HEADER AS (SELECT );
INSERT INTO


CREATE TEMPORARY TABLE IF NOT EXISTS hash_key AS ();
CREATE TEMPORARY TABLE IF NOT EXISTS hash_val AS ();
CREATE TEMPORARY TABLE IF NOT EXISTS hash_card AS ();


DROP TEMPORARY TABLE IF EXISTS hash_key;
DROP TEMPORARY TABLE IF EXISTS hash_val;
DROP TEMPORARY TABLE IF EXISTS tc;
DROP TEMPORARY TABLE IF EXISTS tcc;

CREATE TEMPORARY TABLE IF NOT EXISTS tcc AS (
	SELECT NULL AS uid, ${user_id}, card_id, content, \`type\`, data_type, extension, \`order\`, file_name, NOW() AS create_time, NOW() AS update_time
		FROM market.content WHERE card_id IN (
										SELECT uid FROM market.card WHERE item_id = ${item_id})
	);
UPDATE tcc, hash_card SET tcc.card_id = hash_card.value WHERE tcc.card_id = hash_card.key;
INSERT INTO market.content SELECT * FROM tcc;

DROP TEMPORARY TABLE IF EXISTS hash_board;
DROP TEMPORARY TABLE IF EXISTS hash_card;
DROP TEMPORARY TABLE IF EXISTS tcc;

SET SQL_SAFE_UPDATES = 1;
SELECT * FROM market.list WHERE content_id=${payment_id} AND \`type\`="copied";
`;

	executor(sql)
		.then(result => res.status(200).json({ success: true, detail: result[result.length-1]}))
		.catch(e => res.status(500).json({ success: false, detail: e}));
	}
);
router.get("/copy_item_list/:id", (req, res, next) => {

 // test variable
 const payment_id = -999;


 const getItemListHeader = id => 
    new Promise((resolve, reject) => {
	try {
	  resolve(
		executor(
      		`SELECT * FROM market.list_header WHERE \`type\`="practice" AND content_id = ${id};` 
		));
	} catch(e) {
	  console.error(e);
	  reject(e);
	}
    });
 
 const copyItemListHeader = (list) =>
   new Promise((resolve,reject) => {
     try {
       list.forEach(
			element => 
       	 		executor(`INSERT INTO market.list_header(name, type, content_id, editor_type) SELECT name, 'copied' AS \`type\`, ${payment_id}, editor_type FROM market.list_header WHERE uid=${element.uid};`)
       );
       resolve(list);
     } catch(e){ console.error(e); reject(e); }
   });
 const getItemList = headers => 
   new Promise((resolve, reject) =>{
     try { 
		Promise.all(
			headers.map(element =>
				executor(`SELECT * FROM market.list WHERE list_header_id=${element.uid}`)))
					.then( rst => 
						{ console.log(rst); resolve(rst);}); 
	} catch (e) { 
		console.error(e);
		reject(e);
	};
   });

 const copyItemList = (list) =>
    new Promise((resolve, reject) => {
      try {
//	list.forEach(element =>
////	  executor(
////`INSERT INTO market.list VALUES (list_header_id, type, user_id, content_id, title, order) SELECT ${list_header_id}, "copied" as `type`, ${user_id}, ${payment_id}, title, order FROM market.list WHERE list_header_id=${list_header_id};`
////	  )
//	);
	 resolve(list);
      } catch (e) { console.error(e); reject(e);};
    });

 const getItemCard = () => {};
 const copyItemCard = () => {};
 const getItemContent = () => {};
 const copyItemContent = () => {};

//const sql = 
  getItemListHeader(req.params.id)
    .then(copyItemListHeader)
    .then(getItemList)
    //.then(copyItemList)
    //.then(getItemCard)
    //.then(copyItemCard)
    //.then(getItemContent)
    //.then(copyItemContent)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
});

module.exports = router;

