const connection = require("../../configs/connection");

exports.addOrder = (req, res, next) => {
// console.log("결제하기");
    const insertOrder = (data)=>{
        return new Promise((resolve,reject)=>{
            connection.query("INSERT INTO opendesign.order SET ?",data,(err,rows)=>{
                if(!err){
                    resolve(rows);
                }
                else{
                    reject(err);
                }
            })
        })
    }
    insertOrder(req.body);
};

exports.getOrderList = (req,res,next)=>{
    console.log("getOrderlist!!!");
    const SearchOrderList = (user_id)=>{
        return new Promise((resolve,reject)=>{
            connection.query(`SELECT * FROM opendesign.order WHERE user_id=${user_id}`,
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

    const respond = (data)=>{
        console.log("data",data);
        res.status(200).json({
            message:"요청이 정상적으로 처리되었습니다.",
            sucess:true,
            list:data
        })
    };

    SearchOrderList(req.params.id)
    .then(respond);
}