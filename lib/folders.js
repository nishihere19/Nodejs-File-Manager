var mongoose = require('mongoose');
const Schema= require('mongoose').Schema

var FolderSchema = new mongoose.Schema({
	users: [{type: Schema.Types.ObjectId, ref: 'User'}],
	path: String,
	size: String,
	type: String,
	fieldname: String,
  originalname: String,
  encoding: String,
  mimetype: String,
  destination: String,
  files:[ {type: Schema.Types.Mixed, ref: 'File'}],
changed: {type: String, default: "false"}
});

module.exports = mongoose.model('Folder', FolderSchema);
