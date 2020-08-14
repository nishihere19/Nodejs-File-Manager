var mongoose = require('mongoose');
const Schema= require('mongoose').Schema

var FileSchema = new mongoose.Schema({
	username: {type: Schema.Types.String, ref: 'Users'},
	path: String,
	size: String,
	type: String,
	fieldname: String,
  originalname: String,
  encoding: String,
  mimetype: String,
  destination: String,
  filename: String,
changed: {type: String, default: "false"}
});

module.exports = mongoose.model('File', FileSchema);
