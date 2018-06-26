var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/db');

var db = mongoose.connection;

// User Schema
var UserSchema = new mongoose.Schema({

	file : {
	  	
	  },
	email : {
		type : String
	},
	password : {
		type : String,
          bcrypt : true
	},
  confirmpassword: {
    type: String
  },
  identity : {
    type : String
  },
  username : {
    type: String
   },

   gmail : {
    type : String
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
  validpassword : {
      type: String
    },
  resetPasswordToken : {
     type : String
   },
   resetPasswordExpires : {
    type : String
   }
  
   
});

 var User = module.exports = mongoose.model('User', UserSchema);

  module.exports.comparePassword = function(candidatePassowrd, hash, callback){
     bcrypt.compare(candidatePassowrd, hash, function(err, isMatch){
         if(err) return callback(err);
         callback(null, isMatch);
     });
   }

  module.exports.getUserById= function(name, callback){
      User.findById(name, callback);
  }

 module.exports.getUserByUsername = function(email, callback){
     var query = {'email': email};
     User.findOne(query, callback);
     
     // console.log(email);
 }

 module.exports.createUser = function(newUser,callback){
     bcrypt.hash(newUser.password, 10, function(err, hash){
         if(err) throw err;

         // Set Hashed password
         newUser.password = hash;

         // Create User
         newUser.save(callback);
         });
 };
