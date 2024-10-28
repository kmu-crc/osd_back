const express = require("express");
const axios = require("axios");
const connection = require("../../configs/connection");

const { S3Upload } = require("../../middlewares/S3Sources");
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const unzipper = require('unzipper');
const iconvlite = require('iconv-lite');

const grade_server = "3.37.39.154"



/*---------------------------
	ERROR 	
-----------------------------*/
const issue = [];
const ERROR = (str) => {
	issue.push(str);
	console.error("[ERROR]:", str);
};
const LOG = (str) => {
	console.log("[LOG]:", str);
};

/*---------------------------
	CREATE PROBLEM
-----------------------------*/
exports.makeProblemDir = async (req, res, next) => {
	// console.log(req.files);
	res.status(200).json({data:req});
	return;
	const pDir = req.files['problem-directory'];
	console.log(pDir);
	res.status(200).json({result:"good"});
	return;
	let zipfile = "";
	let directory = "";
	if(!zfile){
		res.status(200).json({success:false, detail:"NO FILE"});
		return;
	}
	const pdfUpload = (obj) => {
	LOG("upload pdf");
		return new Promise( async(resolve) => {
			const pdfpath = obj.files.find(file=>file.search(".pdf")!==-1);
			obj.content = await S3Upload(`uploads/${pdfpath}`, `${pdfpath.replace("uploads/","")}`);
			resolve(obj);
		});		
	};
	const writefile = (file) => {
	LOG("writefile");
		return new Promise((resolve, reject) => {
			file.newfilename = `${new Date().getTime()}.zip`;
			file.path = `uploads/${file.newfilename}`;
			zipfile = file.newfilename;
			directory = `uploads/${file.name.replace(".zip","")}`;
			fs.writeFile(file.path, file.data, {encoding: "ascii"}, async err => {
				if(err){
					ERROR('[ERROR] Write file : ' + err);
					reject(err);
				}
				resolve(file);
			});
		});
	}
	const readfile = (file) => {
	LOG("readfile");
		return new Promise((resolve, reject) => {
			try {
				const files = [];
				fs.createReadStream(file.path)
					.pipe(unzipper.Parse())
					.on('entry', entry => {
						//except __MACOSX and Directory
						if(entry.path.search("__MACOSX") === -1 && entry.type === "File"){
							files.push(entry.path);
						}
						entry.autodrain();
					}).on('close', function(){
						resolve({...file, files});
					});
			} catch(e){
				ERROR(e);
				reject(e);
			}
		});
	};
	const checkZipFile = (obj) => {
	LOG("check zip file");
		return new Promise((resolve,reject)=>{
			let checklist = {
				pdf: false,
				input: false,
				output: false,
				info: false
			};
			obj.files.forEach(file=>{
				if(file.search('.pdf') >0 ) 
				checklist.pdf = checklist.pdf || file.search('.pdf') > -1 ? true: false;
				checklist.input = checklist.input || file.search('input.txt') > -1 ? true: false;
				checklist.output = checklist.output || file.search('output.txt') > -1 ? true: false;
				checklist.info = checklist.info || file.search('info.txt') > -1 ? true: false;
			});

			let valid = true;
			
			if(!checklist.pdf){
				valid = false;
				ERROR("not exists pdf file");
			}
			if(!checklist.input){
				valid = false;
				ERROR("not exists input.txt file");
			}
			if(!checklist.output){
				valid = false;
				ERROR("not exists output.txt file");
			}
			if(!checklist.info){
				valid = false;
				ERROR("not exists info.txt file");
			}

			if(valid){ 
				LOG("valid");
				resolve(obj);
			}
			else{
				ERROR("invalid zip file");
				reject(false);
			}
		});
	};
	const extract = (obj) => {
	LOG("extract");
		return new Promise((resolve, reject)=>{
			try{
			fs.createReadStream(obj.path)
				.pipe(unzipper.Parse())
				.on('entry', async entry => {
					if(entry.type === "Directory" && entry.path.search("__MACOSX")===-1) {
						const dir = `uploads/${entry.path}`;
						if(!fs.existsSync(dir)){
							fs.mkdirSync(dir);
						}
					}
					if(entry.type === "File" && entry.path.search("__MACOSX")===-1) {
						const content = await entry.buffer();
						await fs.writeFileSync(`uploads/${entry.path}`, content);
					}
				})
				.on('close',()=>{
					resolve(obj);
				});
				//.pipe(unzipper.Extract({path: `uploads/${obj.newfilename}`}));
				}catch(e){ERROR("[ERROR] EXTRACT"+e);reject(e);}
		});
	};
	const getInfo = (obj) => {
	LOG("get info");
		return new Promise((resolve, reject)=>{

			const infopath = obj.files.find(file=>file.search("info.txt")!==-1);	

			fs.readFile(`uploads/${infopath}`, /*'utf8',*/ (err,data)=>{
			if(err){ 
				ERROR('[ERROR] INFO file:'+err);
				reject(err);
			}

			try{

				const _data = iconvlite.decode(data, 'euc-kr');

				const info = _data.replace(/[\n\r]+/g, '\n').split('\n');
				const name = info[0].split("=");
				const type = info[1].split("=");
				const time = info[2].split("=");
				const space= info[3].split("=");
				if(
				(name[0].toLowerCase() !=="name")
				||(type[0].toLowerCase() !=="type")
				||(time[0].toLowerCase() !=="limitedtime")
				||(space[0].toLowerCase() !=="limitedmemory")
				){
					issue.push('[ERROR] INVALID FORMAT');
					reject(false);
				}
				obj.info = { name:name[1], problem_type: type[1], time: parseInt(time[1],10), space: parseInt(space[1],10)};
				resolve(obj);
			}catch(e){
				ERROR('[ERROR] INFO file: '+e);
				reject(e);
			}
			});
		})
	};
	const getInput = (obj) => {
	LOG("get input");
		return new Promise(async (resolve, reject)=>{
			const inputpath = obj.files.find(file=>file.search("input.txt")!==-1);
			fs.readFile(`uploads/${inputpath}`, 'utf8', (err,data)=>{
				if(err){ 
					ERROR('[ERROR] INPUT file:'+err);
					reject(err);
				}
		
				try{
					const inputs = data.replace(/\r\n/g,"\n").split(/input#[0-9]*\n/g);
					inputs.shift();
					obj.inputs = inputs;
					resolve(obj);
				}catch(e){
					issue.push('[ERROR] INPUT file: exception '+e);
					reject(e);
				}
			});
		})
	};
	const getOutput = (obj) => {
	LOG("get output");
		return new Promise((resolve, reject)=>{
			const outputpath = obj.files.find(file=>file.search("output.txt")!==-1);
			fs.readFile(`uploads/${outputpath}`, 'utf8', (err,data)=>{
				if(err){ 
					ERROR('[ERROR] OUTPUT file:'+err);
					reject(err);
				}
				try{
					const outputs = data.replace(/\r\n/g,"\n").split(/output#[0-9]*\n/g);
					outputs.shift();
					obj.outputs = outputs;
					resolve(obj);
				}catch(e){
					ERROR('[ERROR] OUTPUT file: exception '+e);
					reject(e);
				}
			});
		})
	};
	const mergeInputOutput = (obj) => {
	LOG("merge input and output");
		return new Promise((resolve, reject)=>{
			const merge = [];
			try{
				obj.inputs.forEach(async (input,index)=>{
					const item ={order:index,input:input,output:obj.outputs[index]};
					merge.push(item);
				});	

				obj.testcase = merge;
				delete obj.inputs;
				delete obj.outputs;
				resolve(obj);

			} catch(e){
				ERROR('MERGE INPUT & OUTPUT: '+e);
				reject(e);
			}
		});	
	};
	const submit = (obj) => {
	LOG("submit");
		return new Promise((resolve, reject) => {
		const problem = {
		  //"language_id": 0,
		  "name": obj.info.name || "name",
		  "contents": obj.content || "contents",
		  //"template": "string",
		  "time": obj.info.time || 0,
		  "memory": obj.info.space || 0,
		  "problem_type": obj.info.problem_type || "s",
		  "testcase": obj.testcase || { order: 0, input:"",output:""},
		  //"checker": { "language": 0, "code": "string"},
		  "categories": obj.categories || []
		};
	
		const url = `http://${grade_server}:8080/api/v1/problem/treat/`;
		axios.post(url, problem)
			.then(res => {
				if(res.statusText==='OK'){
					obj.submit = problem;
					resolve(obj);
				}
			})
			.catch(e => {
				reject(e);
			});
		});
	};
	const success = (obj) => { 
		LOG("success");
		res.status(200).json({success: true, data: obj});
	};
	const failed = (e) => { 
		LOG("failed");
		res.status(200).json({success: false, data: issue.length === 0 ? e : issue});
	};
	const remove_directory = () => {
	LOG("remove directory:"+directory);
		return new Promise(async(resolve)=>{
			var rimraf = require('rimraf');
			rimraf.sync(directory);
		//	await fs.rmdirSync(directory /*dir*/,	{recursive:true});
			// , err=>{
			// 	if(err){
			// 		ERROR("[error] remove file: "+err);	
			// 		reject(err);
			// 	}
			// 	resolve(true);
			// });
			resolve(true);
		});
	};
  const remove_zip_file = () => {
	LOG("remove zip file:"+zipfile);
		return new Promise((resolve, reject)=>{
			fs.unlink(`uploads/${zipfile}`, (err) => {
				if(err) {
					ERROR(err);
					reject(err);
				}
				resolve(true);
			});
		});
	};
	writefile(zfile)
		.then(readfile)
		 .then(checkZipFile)
		 .then(extract)
		 .then(getInfo)
		 .then(getInput)
		 .then(getOutput)
		 .then(mergeInputOutput)
		 .then(pdfUpload)
		 .then(submit)
		.then(success)
		.catch(failed)
		.then(remove_zip_file)
		.then(remove_directory)
};
exports.makeProblemZip = async (req, res, next) => {
	const zfile = req.files['zip-file'];
	let zipfile = "";
	let directory = "";
	if(!zfile){
		res.status(200).json({success:false, detail:"NO FILE"});
		return;
	}
	const pdfUpload = (obj) => {
	LOG("upload pdf");
		return new Promise( async(resolve) => {
			const pdfpath = obj.files.find(file=>file.search(".pdf")!==-1);
			obj.content = await S3Upload(`uploads/${pdfpath}`, `${pdfpath.replace("uploads/","")}`);
			resolve(obj);
		});		
	};
	const writefile = (file) => {
	LOG("writefile");
		return new Promise((resolve, reject) => {
			file.newfilename = `${new Date().getTime()}.zip`;
			file.path = `uploads/${file.newfilename}`;
			zipfile = file.newfilename;
			directory = `uploads/${file.name.replace(".zip","")}`;
			fs.writeFile(file.path, file.data, {encoding: "ascii"}, async err => {
				if(err){
					ERROR('[ERROR] Write file : ' + err);
					reject(err);
				}
				resolve(file);
			});
		});
	}
	const readfile = (file) => {
	LOG("readfile");
		return new Promise((resolve, reject) => {
			try {
				const files = [];
				fs.createReadStream(file.path)
					.pipe(unzipper.Parse())
					.on('entry', entry => {
						//except __MACOSX and Directory
						if(entry.path.search("__MACOSX") === -1 && entry.type === "File"){
							files.push(entry.path);
						}
						entry.autodrain();
					}).on('close', function(){
						resolve({...file, files});
					});
			} catch(e){
				ERROR(e);
				reject(e);
			}
		});
	};
	const checkZipFile = (obj) => {
	LOG("check zip file");
		return new Promise((resolve,reject)=>{
			let checklist = {
				pdf: false,
				input: false,
				output: false,
				info: false
			};
			obj.files.forEach(file=>{
				if(file.search('.pdf') >0 ) 
				checklist.pdf = checklist.pdf || file.search('.pdf') > -1 ? true: false;
				checklist.input = checklist.input || file.search('input.txt') > -1 ? true: false;
				checklist.output = checklist.output || file.search('output.txt') > -1 ? true: false;
				checklist.info = checklist.info || file.search('info.txt') > -1 ? true: false;
			});

			let valid = true;
			
			if(!checklist.pdf){
				valid = false;
				ERROR("not exists pdf file");
			}
			if(!checklist.input){
				valid = false;
				ERROR("not exists input.txt file");
			}
			if(!checklist.output){
				valid = false;
				ERROR("not exists output.txt file");
			}
			if(!checklist.info){
				valid = false;
				ERROR("not exists info.txt file");
			}

			if(valid){ 
				LOG("valid");
				resolve(obj);
			}
			else{
				ERROR("invalid zip file");
				reject(false);
			}
		});
	};
	const extract = (obj) => {
	LOG("extract");
		return new Promise((resolve, reject)=>{
			try{
			fs.createReadStream(obj.path)
				.pipe(unzipper.Parse())
				.on('entry', async entry => {
					if(entry.type === "Directory" && entry.path.search("__MACOSX")===-1) {
						const dir = `uploads/${entry.path}`;
						if(!fs.existsSync(dir)){
							fs.mkdirSync(dir);
						}
					}
					if(entry.type === "File" && entry.path.search("__MACOSX")===-1) {
						const content = await entry.buffer();
						await fs.writeFileSync(`uploads/${entry.path}`, content);
					}
				})
				.on('close',()=>{
					resolve(obj);
				});
				//.pipe(unzipper.Extract({path: `uploads/${obj.newfilename}`}));
				}catch(e){ERROR("[ERROR] EXTRACT"+e);reject(e);}
		});
	};
	const getInfo = (obj) => {
	LOG("get info");
		return new Promise((resolve, reject)=>{

			const infopath = obj.files.find(file=>file.search("info.txt")!==-1);	

			fs.readFile(`uploads/${infopath}`, /*'utf8',*/ (err,data)=>{
			if(err){ 
				ERROR('[ERROR] INFO file:'+err);
				reject(err);
			}

			try{

				const _data = iconvlite.decode(data, 'euc-kr');

				const info = _data.replace(/[\n\r]+/g, '\n').split('\n');
				const name = info[0].split("=");
				const type = info[1].split("=");
				const time = info[2].split("=");
				const space= info[3].split("=");
				if(
				(name[0].toLowerCase() !=="name")
				||(type[0].toLowerCase() !=="type")
				||(time[0].toLowerCase() !=="limitedtime")
				||(space[0].toLowerCase() !=="limitedmemory")
				){
					issue.push('[ERROR] INVALID FORMAT');
					reject(false);
				}
				obj.info = { name:name[1], problem_type: type[1], time: parseInt(time[1],10), space: parseInt(space[1],10)};
				resolve(obj);
			}catch(e){
				ERROR('[ERROR] INFO file: '+e);
				reject(e);
			}
			});
		})
	};
	const getInput = (obj) => {
	LOG("get input");
		return new Promise(async (resolve, reject)=>{
			const inputpath = obj.files.find(file=>file.search("input.txt")!==-1);
			fs.readFile(`uploads/${inputpath}`, 'utf8', (err,data)=>{
				if(err){ 
					ERROR('[ERROR] INPUT file:'+err);
					reject(err);
				}
		
				try{
					const inputs = data.replace(/\r\n/g,"\n").split(/input#[0-9]*\n/g);
					inputs.shift();
					obj.inputs = inputs;
					resolve(obj);
				}catch(e){
					issue.push('[ERROR] INPUT file: exception '+e);
					reject(e);
				}
			});
		})
	};
	const getOutput = (obj) => {
	LOG("get output");
		return new Promise((resolve, reject)=>{
			const outputpath = obj.files.find(file=>file.search("output.txt")!==-1);
			fs.readFile(`uploads/${outputpath}`, 'utf8', (err,data)=>{
				if(err){ 
					ERROR('[ERROR] OUTPUT file:'+err);
					reject(err);
				}
				try{
					const outputs = data.replace(/\r\n/g,"\n").split(/output#[0-9]*\n/g);
					outputs.shift();
					obj.outputs = outputs;
					resolve(obj);
				}catch(e){
					ERROR('[ERROR] OUTPUT file: exception '+e);
					reject(e);
				}
			});
		})
	};
	const mergeInputOutput = (obj) => {
	LOG("merge input and output");
		return new Promise((resolve, reject)=>{
			const merge = [];
			try{
				obj.inputs.forEach(async (input,index)=>{
					const item ={order:index,input:input,output:obj.outputs[index]};
					merge.push(item);
				});	

				obj.testcase = merge;
				delete obj.inputs;
				delete obj.outputs;
				resolve(obj);

			} catch(e){
				ERROR('MERGE INPUT & OUTPUT: '+e);
				reject(e);
			}
		});	
	};
	const submit = (obj) => {
	LOG("submit");
		return new Promise((resolve, reject) => {
		const problem = {
		  //"language_id": 0,
		  "name": obj.info.name || "name",
		  "contents": obj.content || "contents",
		  //"template": "string",
		  "time": obj.info.time || 0,
		  "memory": obj.info.space || 0,
		  "problem_type": obj.info.problem_type || "s",
		  "testcase": obj.testcase || { order: 0, input:"",output:""},
		  //"checker": { "language": 0, "code": "string"},
		  "categories": obj.categories || []
		};
	
		const url = `http://${grade_server}:8080/api/v1/problem/treat/`;
		axios.post(url, problem)
			.then(res => {
				if(res.statusText==='OK'){
					obj.submit = problem;
					resolve(obj);
				}
			})
			.catch(e => {
				reject(e);
			});
		});
	};
	const success = (obj) => { 
		LOG("success");
		res.status(200).json({success: true, data: obj});
	};
	const failed = (e) => { 
		LOG("failed");
		res.status(200).json({success: false, data: issue.length === 0 ? e : issue});
	};
	const remove_directory = () => {
	LOG("remove directory:"+directory);
		return new Promise(async(resolve)=>{
			var rimraf = require('rimraf');
			rimraf.sync(directory);
		//	await fs.rmdirSync(directory /*dir*/,	{recursive:true});
			// , err=>{
			// 	if(err){
			// 		ERROR("[error] remove file: "+err);	
			// 		reject(err);
			// 	}
			// 	resolve(true);
			// });
			resolve(true);
		});
	};
  const remove_zip_file = () => {
	LOG("remove zip file:"+zipfile);
		return new Promise((resolve, reject)=>{
			fs.unlink(`uploads/${zipfile}`, (err) => {
				if(err) {
					ERROR(err);
					reject(err);
				}
				resolve(true);
			});
		});
	};
	writefile(zfile)
		.then(readfile)
		 .then(checkZipFile)
		 .then(extract)
		 .then(getInfo)
		 .then(getInput)
		 .then(getOutput)
		 .then(mergeInputOutput)
		 .then(pdfUpload)
		 .then(submit)
		.then(success)
		.catch(failed)
		.then(remove_zip_file)
		.then(remove_directory)
};
/*---------------------------
	DELETE PROBLEM
-----------------------------*/
// exports.removeProblem = async (req, res, next) => {
// 
// 	const remove = (id) => {
// 		return new Promise((resolve, reject) => {
// 		axios.delete(`https://3.34.142.28:8080/api/v1/problem/treat/${id}/`)
// 			.then(
// 		};
// 	};
// 	remove(req.params.id)
// 		.then(respond => respond.statusText === "OK" ? res.status(200).json({
// };



/*-----------------
const checkfile = (files) => {
	let checklist = { input: false, output: false, info: false, };
};
exports.= (req, res, next) => {
};
-----------------*/
