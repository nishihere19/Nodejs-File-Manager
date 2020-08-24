var mongoose = require('mongoose')
Schema= require('mongoose').Schema


var UsersSchema = mongoose.Schema({
	username : {type: String, index: true, unique: true},
	password : String,
	firstname : String,
	lastname : String,
	files:[{type: Schema.Types.ObjectId, ref: 'File'}],
	folders:[{type: Schema.Types.ObjectId, ref: 'Folder'}],
	lastlogin : {type: Date, default : Date.now}
});


var Users = mongoose.model('Users', UsersSchema);
module.exports = Users