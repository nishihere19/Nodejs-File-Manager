var express = require('express');
var router = express.Router();
var User = require('../lib/users');
var File = require('../lib/files');
var multer= require('multer');
const Folder = require('../lib/folders');
const user=new User;
const bcrypt=require('bcrypt');
const folders = require('../lib/folders');

var upload = multer({
	dest:'./uploads'
})


router.get('/', function(req, res, next) {
	
	var file=[]
	if(req.session.user){
		
		res.render('dashboard',{ title: 'Welcome to your File Manager!!', message: "LoggedIn Successfully as "+req.session.user.firstname+" "+req.session.user.lastname+"("+req.session.user.username+")."});
	}
	else{
		res.render('index', { title: 'Welcome to your File Manager!!',msg:'' });
	}
	
});
router.get('/autocomplete',function(req,res,next){
	//console.log(data);
	var regex = new RegExp(req.query["term"],'i');
	var user=File.find({user: req.session.user._id,originalname: regex}).sort({"updated_at":-1}).sort({"created":-1});
	user.exec(function(err,data){
		console.log(data);
		var arr=[]
		if(err){
			console.log(err);
		}
		if(data){
			data.forEach(user1 => {
				let obj={
					id: user1._id,
					label: user1.originalname
				}
				arr.push(obj);
			});
			var user2=Folder.find({user: req.session.user._id,originalname: regex}).sort({"updated_at":-1}).sort({"created":-1});
			user2.exec(function(err,data1){
				//console.log(data1);
				if(err){
					console.log(err);
				}
				if(data1){
					data1.forEach(user2=>{
						let obj={
							if: user2._id,
							label:user2.originalname
						}
						arr.push(obj);
					})
				}
			});
			res.jsonp(arr);
			
		}
	})
})

/* GET loginform */
router.get('/loginform', function(req, res, next){
	res.render('loginform', { title: 'Welcome to your File Manager!!' });
})

/* GET registration form */
router.get('/registerform', function(req, res, next){
	res.render('registerform', { title: 'Welcome to your File Manager!!' });
})
router.get('/Files',function(req,res,next){
	File.find({users: req.session.user._id},function(err,result){
		var arr=[]
		for(i=0;i<result.length;i++){
			arr[i]=result[i]._doc;
		}
		//console.log(arr);
		res.render('files',{title: 'Welcome to your File Manager!!' , message: "LoggedIn Successfully as "+req.session.user.firstname+" "+req.session.user.lastname+"("+req.session.user.username+").", result: arr })

	})
})
router.get('/Folders',function(req,res,next){
	Folder.find({users: req.session.user._id},function(err,result){
		var arr=[]
		for(i=0;i<result.length;i++){
			arr[i]=result[i]._doc;
		}
		//console.log(arr);
		res.render('folders',{title: 'Welcome to your File Manager!!' , message: "LoggedIn Successfully as "+req.session.user.firstname+" "+req.session.user.lastname+"("+req.session.user.username+").", result: arr ,result1:" "})

	})
})

router.get('/FilesView/:id',function(req,res,next){
	folderId=req.params.id;
	
		//console.log(arr);
		//res.render('files',{title: 'Welcome to your File Manager!!' , message: "LoggedIn Successfully as "+req.session.user.firstname+" "+req.session.user.lastname+"("+req.session.user.username+").", result: arr ,result1=""})
		Folder.findOne({_id: folderId},function(err,result){
			if(err){
				console.log(error);
				return;
			}
			else{
				var arr1=[]

				console.log(result._doc.files);
		
			if(result._doc.files.length){
				res.render('ViewFiles',{result1: result._doc.files,id: folderId })
		
			}
			else{
				res.render({result1: " " , id: folderId})
		
			}
			
			
			}
		})
	})
	

router.get('/Files/:file_id',function(req,res,next){
	docId=req.params.file_id;
	var getFile=new File;
	
	File.findOne({_id: docId},function(error,file){
		if(error){
			console.log(error);
			//console.log("worked","error");
			return;
		}
		else if(file){
			getFile=file;
			//console.log("worked");
			res.download("./uploads/"+getFile.filename);
		}
		else{
			res.render("File Not Found");
			return;
		}
	})
})
router.get('/FilesView/Files/:file_id',function(req,res,next){
	docId=req.params.file_id;
	var getFile=new File;
	console.log("worked","2");
	
	File.findOne({filename: docId},function(error,file){
		if(error){
			console.log(error);
			//console.log("worked","error");
			return;
		}
		else if(file){
			getFile=file;
			//console.log("worked","2");
			res.download("./uploads/"+getFile.filename);
			return;
		}
		else{
			res.send("File Not Found");
			return;
		}
	})
})
/* POST login user  */
router.get('/login',function(req,res){
	res.redirect('/');
})
router.get('/register',function(req,res){
	res.redirect('/');
})
router.get('/uploadFile',function(req,res){
	res.redirect('/');
})
router.get('/uploadFolder',function(req,res){
	res.redirect('/');
})
router.post('/login', function(req, res){
	
	var username = req.body.username;
	var password = req.body.password;
	//console.log(username);

	User.findOne({username : username, password : password}, function(err, foundUser){
		//console.log(username);
		if(err){
			console.log("Error - login : ");
			return res.status(500).send("There was some error");
		}

		if(!foundUser){
			res.render("loginform",{title:"Welcome to your file manager!",msg: "Username or password incorrect!"})
		return;
		}
		req.session.user = foundUser;
		//console.log(req.session.user);
		return res.status(200).render("dashboard", {title: 'Welcome to your File Manager!!' , message: "LoggedIn Successfully as "+foundUser.firstname+" "+foundUser.lastname+"("+foundUser.username+")."});

	})
});

/* POST registeration */
router.post('/register', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;

	var newUser = new User();
	newUser.username = username;
	newUser.password = password;
	newUser.firstname = firstname;
	newUser.lastname = lastname;

	newUser.save(function(err, savedUser){
		if (err){
			console.log("error in registering");
			res.render('registerform',{title:"Welcome to your file manager",msg: "This username is not available"});
		}
		//`	console.log(savedUser);
		req.session.user=savedUser;
		return res.status(200).render("dashboard", {title: 'Welcome to your File Manager!!' , message: "Registered Successfully"});
	});
});


/* Dashboard */
router.get('/dashboard', function(req, res){
	if(!req.session.User){
		return res.status(401).send("You need to <a href='/loginform'>Login</a>");
	}
	return res.status(200).send("Welcome!! You are logged in.");
});
router.post('/uploadFile',upload.single('myFile'),(req,res)=>{
	var newfile = new File(req.file);
	newfile.users.push(req.session.user._id);
	//console.log(file);
	console.log(newfile);

	newfile.save(function(err, saveFile){
		if (err){
			console.log(err);
			return res.status(500).send("File could not be saved.");
		}
		User.update({_id:req.session.user._id},{$addToSet:{"files": saveFile._id}},function(err,result){
			if(err) console.log(err);
			else{
				console.log(result);
				console.log(saveFile);
		return res.status(200).render("dashboard", {title: 'Welcome to your File Manager!!' , message: "Registered Successfully"});

			}
		})
			});
	
});
router.post('/uploadFolder',upload.any('myFiles'),(req,res)=>{
	var newfolder = new Folder();
	newfolder.originalname=req.body.nameOfFolder;
	newfolder.users.push(req.session.user._id);
	//newfolder.files=req.files;
	//console.log(file);
	var arr=[];
	for(i=0;i<req.files.length;i++){
		newfolder.files.push(req.files[i])
	}
	
	console.log(newfolder.originalname,"OriginalName");

	newfolder.save(function(err, saveFolder){
		if (err){
			console.log(err);
			return res.status(500).send("Folder could not be saved.");
		}
		//console.log(saveFolder);
		User.update({_id: req.session.user._id},{$addToSet:{"folders": saveFolder._id}},function(err,result){
			if(err) console.log(err);
			else{
				console.log(saveFolder._doc.files);
				return res.status(200).render("dashboard", {title: 'Welcome to your File Manager!!' , message: "Registered Successfully"});
	

			}
		})
		});
	
});
router.get('/logout', (req, res, next) => {
    // Check if the session is exist
    if(req.session.user) {
        // destroy the session and redirect the user to the index page.
        req.session.destroy(function() {
            res.redirect('/');
        });
    }
});
router.get('/DeleteFile/:fileId',(req,res,next)=>{
	id=req.params.fileId;
	File.findOne({_id: id},function(error,file){
		if(error){
			console.log(error);
			res.render('error');

		}
		else{
			file.remove();

			res.redirect('/Files');
		}
	})
})
router.get('/FilesView/DeleteFile/:fileId/:folderId',(req,res,next)=>{
	id=req.params.fileId;
	fId=req.params.folderId;
			Folder.findOne({_id: folderId},(error,result)=>{
				if(error){
					console.log(error);
					res.render('error');
				}
				else{
					for(i=0;i<result._doc.files.length;i++){
						console.log(result._doc.files[i].filename);
						if(id==result._doc.files[i].filename){
							result._doc.files.splice(i,1);
							result.save();
							//console.log(result._doc.files);
						}
					}
					

				}
			})
			res.redirect('/Folders');
		
})
router.get('/DeleteFolder/:folderId',(req,res,next)=>{
	id=req.params.folderId;
	Folder.findOne({_id: id},function(error,folder){
		if(error){
			console.log(error);
			res.render('error');

		}
		else{
			var arr1=[]
			for(i=0;i<folder.files.length;i++){
				arr1[i]=folder._doc.files[i];
				//console.log(result._doc);
				File.findOne({originalname: arr1[i].originalname},function(error,file){
                 if(error){
					 console.log(error);
				 }
				 if(file){
					 file.remove();
				 }
				 else{
					 console.log("file not found");
				 }
				})
			}
			folder.remove();
			res.redirect('/Folders');
		}
	})
})
router.post('/search',function(req,res,next){
	var string=""
	string=req.body.Searchval;
	console.log(string);
	string=string.toString();
	string= string.toLowerCase();
	console.log(string);
	var folders=[], files=[];
	Folder.find({user: req.session.user._id},function(error,result){
		if(error){
			console.log(error);
		}
		else{
			for(i=0;i<result.length;i++){
				folders[i]=result[i];
				//console.log(folders[i],"folder");
			}
		}
		
	
	File.find({user: req.session.user._id},function(error,result1){
		if(error){
			console.log(error);
			res.render('error');
		}
		else{
			for(i=0;i<result1.length;i++){
				files[i]=result1[i];
				//console.log(files[i],"files");
			}
		}
		
		var SearchFolders=[], SearchFiles=[];
		for(i=0;i<folders.length;i++){
			var name=folders[i]._doc.originalname;
			name= name.toLowerCase();
			if(name.indexOf(string)>=0){
				SearchFolders.push(folders[i]);
				//console.log(folders[i]);
			}
			//console.log(folders[i].indexOf(string));
		}
		for(i=0;i<files.length;i++){
			var name=files[i]._doc.originalname;
			name= name.toLowerCase();
			if(name.indexOf(string)>=0){
				SearchFiles.push(files[i]);
				//console.log(files[i]);
			}
			//console.log(files[i].indexOf(string));
		}
		
		//res.redirect('/');
    res.render('searchresults',{title: 'Welcome to your File Manager!!' , message: "LoggedIn Successfully as "+req.session.user.firstname+" "+req.session.user.lastname+"("+req.session.user.username+").",result: SearchFolders, result1: SearchFiles})
	})
})
		
})
router.get('/resetPass',function(req,res,next){
	if(req.session.user){
		res.render('resetPass',{msg:""});
	}
	else{
		res.redirect('/');
	}
})
router.post('/resetPassword',(req,res,next)=>{
	if(req.body.currentPass==req.session.user.password){
		if(req.body.newPass==req.body.confirmNewPass){
			User.findOne({username: req.session.user.username}, function(error,user){
				if(error){
					console.log(error);
				}
				else{
					user.password=req.body.newPass;
					user.save(function(error,user1){
						if(error){
							console.log(error);
						}
						else{
							console.log(user1);
						}
					});
				}
				res.render('resetPass',{msg:"Password changed successfully!"})
			})
		}
		else{
			res.render('resetPass',{msg:"New Password and Confirm New Password did not match! Please Try Again"})
		}
	}
	else{
		res.render('resetPass',{msg:"Current Password is not correct! Please Try Again"})
	}
	
})
router.get('/delUser', function(req, res){
	
	var username = req.session.user.username;
	var password = req.session.user.password;
	//console.log(username);

	User.findOne({username : username, password : password}, function(err, foundUser){
		//console.log(username);
		if(err){
			console.log("Error - login : ");
			return res.status(500).send("There was some error");
		}

		if(!foundUser){
			return res.status(404).send("User not found");
		}
		Folder.find({username: foundUser.username},function(error,folder){
			if(error){
				console.log(error);
			}
			else{
				for(j=0;j<folder.length;j++){
			        var arr1=[]
			for(i=0;i<folder[j].files.length;i++){
				arr1[i]=folder[j]._doc.files[i];
				//console.log(result._doc);
				File.findOne({originalname: arr1[i].originalname},function(error,file){
                 if(error){
					 console.log(error);
				 }
				 if(file){
					 file.remove();
				 }
				 else{
					 console.log("file not found");
				 }
				})
			}
			folder[j].remove();
		}
			}
		})
		File.find({username: foundUser.username},function(error,file){
			if(error){
				console.log(error);
			}
			else{
				for(i=0;i<file.length;i++){
					file[i].remove();
				}
			}
		})
		foundUser.remove();
		//console.log(req.session.user);
		req.session.destroy();
		res.render('index', { title: 'Welcome to your File Manager!!',msg:"User Account Deleted" });
	})
});
router.get('/addfiles/:id',(req,res,next)=>{
var id=req.params.id;
res.render('addfiles',{folderid:id});
})
router.post('/addfiles/:id',upload.any('myFiles'),function(req,res,next){
	var id=req.params.id;
	//console.log(req.files);
	for(i=0;i<req.files.length;i++){
		Folder.update({_id:id},{$addToSet:{"files":req.files[i]}},function(err,result){
			if(err) console.log(err);
			else{
	
				console.log(result,"Files Added");
				res.render('dashboard',{message:"Files Added Successfully!"});
			}
		})
	}
	
})
module.exports = router;
