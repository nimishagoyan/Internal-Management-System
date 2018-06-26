var mongoose = require('mongoose');
// var bcrypt = require('bcryptjs');

mongoose.createConnection('mongodb://localhost:27017/db');

var db = mongoose.connection;

// User Schema
var UserSchema = new mongoose.Schema({

username : {
      type: String
	},
    projectname: {
        type: String
    },
    task_insert : {
       type: String
    },
    status : {
        type: String
    },
    imgpath: {
        type: String
    }
   
});

module.exports = mongoose.model('projectdetails', UserSchema);