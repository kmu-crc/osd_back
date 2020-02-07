const connection = require("../../configs/connection");
exports.addCart = (req,res,next)=>{
	console.log("addCart",req.body);
	const insertCart = (data) =>{
	 	return new Promise((resolve,reject)=>{
			connection.query("INSERT INTO opendesign.cart SET ?", data, (err, rows) => {
				if(!err){
					console.log(rows);
					resolve(rows);
				}
				else{
					reject(err);
				}
	 		})
	 	})
	 }
	 insertCart(req.body);
};
exports.deleteSelectCart = (req,res,next)=>{
	console.log("===============delete_select",req.body);
	const deleteItem = (data) =>{
	 	return new Promise((resolve,reject)=>{
			connection.query("DELETE FROM opendesign.cart WHERE uid=?", data, (err, rows) => {
				if(!err){
					console.log(rows);
					resolve(rows);
				}
				else{
					reject(err);
				}
	 		})
	 	})
	 }
	 deleteItem(req.params.id);
};
exports.deleteAllCart = (req,res,next)=>{
	console.log("============delete_all",req.body);
	const deleteAllItem = (data) =>{
	 	return new Promise((resolve,reject)=>{
			connection.query("DELETE FROM opendesign.cart WHERE user_id=?", data, (err, rows) => {
				if(!err){
					console.log(rows);
					resolve(rows);
				}
				else{
					reject(err);
				}
	 		})
	 	})
	 }
	 deleteAllItem(req.params.id);
};
exports.getCartList = (req,res,next)=>{
	console.log("===============getCartList=============");
	const SearchCartList=(user_id)=>{

	return new Promise((resolve,reject)=>{
		// connection.query(`SELECT * FROM opendesign.cart WHERE user_id=${user_id}`,
		connection.query(`SELECT DISTINCT C.uid,C.user_id,C.product_id,C.amount,C.product_option,T.s_img,P.price,D.title FROM opendesign.cart C 
		LEFT JOIN opendesign.thumbnail T ON T.uid 
		IN(SELECT thumbnail FROM opendesign.design WHERE uid=C.product_id) 
		LEFT JOIN opendesign.price P ON P.design_id=C.product_id
		LEFT JOIN opendesign.design D ON D.uid=C.product_id
		WHERE C.user_id=${user_id}`,
		(err,rows)=>{
			if(!err){
				resolve(rows);
			}
			else{
				reject(err);
			}
		});
		});		
	};
  const respond = (data) => {
    console.log("data", data);
    res.status(200).json({
      message: "요청이 정상적으로 처리되었습니다.",
      success: true,
      list: data
	}
	)
};
	SearchCartList(req.params.id)
	.then(respond);
};
