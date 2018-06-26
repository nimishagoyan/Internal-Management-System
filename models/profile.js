var mongoose = require('mongoose');
// var bcrypt = require('bcryptjs');

mongoose.createConnection('mongodb://localhost:27017/db');

var db = mongoose.connection;

// User Schema
var UserSchema = new mongoose.Schema({
    file:{

    },
    email: {
        type: String
    },
    username: {
        type: String
    },
    dof: {
      type: String
    }, 
    address: {
        type: String
    },
    phonenumber: {
       type: String
    },
    skills: {
      type: String
    },
  
   
});

module.exports = mongoose.model('profile', UserSchema);