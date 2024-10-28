const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");

//AWS.config({ region: 'us-west-1'});

exports.SendMail = (req, res, next) => {

const transporter = nodemailer.createTransport({
	SES: new AWS.SES({apiVersion: '2010-12-01', region: 'us-west-1'})
});

	transporter.sendMail({
		from: 'opensrcdesign@gmail.com',
		to: 'opensrcdesign@gmail.com',
		subject: 'test -----email',
		html: '<h1>test</h1>'
		}, (err, info) => {
			if(err) {
				console.error(err);
				res.status(400).json({success:false});
			}
			console.log('sendEmail: ' + JSON.stringify(info));
			console.log(info.messageId);
			res.status(200).json({success:true});
		});
}
//const AWS = require("aws-sdk");
//const client = new AWS.SES({region: 'us-west-1'});
//
//exports.SendMail = (req, res, next) => {
//
//// Create sendEmail params 
//const params = {
//	Destination: { /* required */
//		CcAddresses: [],
//		ToAddresses: [ 'w.ggmsng@gmail.com', ]
//	},
//	Message: { /* required */
//		Body: { /* required */
//		Html: {
//			Charset: "UTF-8",
//			Data: "<html><title>email test</title><body>eamil send test</body></html>"
//		},
//		Text: {
//			Charset: "UTF-8",
//			Data: "TEXT_FORMAT_BODY :)"
//		}
//		},
//		Subject: {
//			Charset: 'UTF-8',
//			Data: 'Test email'
//		}
//	},
//	Source: 'opensrcdesign@gmail.com', /* required */
//	ReplyToAddresses: [],
//	};
//
////const sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
////
////sendPromise
////	.then( (data)=> { console.log(data.MessageId); res.status(200).json({success:true, detail: data});})
////	.catch( (err)=> { console.error(err, err.stack); res.status(400).json({success:false, detail: err});});
////
//client
//	.cloneReceiptRuleSet(params)
//	.then((data) => { console.log(data); res.status(200).json({success:true}); })
//	.catch((error) => { console.error(error); res.status(400).json({success:false});});
//
//
//};
