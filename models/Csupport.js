var mongoose = require('mongoose');
// var bcrypt = require('bcryptjs');

mongoose.createConnection('mongodb://localhost:27017/db');

var db = mongoose.connection;

// User Schema
var UserSchema = new mongoose.Schema({
	

receiver: {
	type: String
},
message: {
	type: String
},
username: {},
sender: {
	type: String
},


// from: {
//   type: String
// }
   
});

 module.exports = mongoose.model('Csupport', UserSchema);
