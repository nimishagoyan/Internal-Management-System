var mongoose = require('mongoose');
// var bcrypt = require('bcryptjs');

mongoose.createConnection('mongodb://localhost:27017/db');

var db = mongoose.connection;

// User Schema
var UserSchema = new mongoose.Schema({

	file: {
    },
  projectname: {
     type: String
  },
  clientname: {
    type: String
  },
  date: {
    type: String
  },

   
});

 module.exports = mongoose.model('invoice', UserSchema);

 
