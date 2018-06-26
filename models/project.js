var mongoose = require('mongoose');
// var bcrypt = require('bcryptjs');

mongoose.createConnection('mongodb://localhost:27017/db');

var db = mongoose.connection;

// User Schema
var UserSchema = new mongoose.Schema({

    // email: {
    //     type: String
    // },
    
    projectname: {
    	type: String
    },
        
    createdate: {
        type: String
    },
    submitdate: {
        type: String
    },
   TeamMember: {
    	 type: String
    },
    description: {
        type: String
    },
    clientname: {
        type: String
    },
    technology: {
        type: String
    },
    Status: {
        type: String
    }
   
});

module.exports = mongoose.model('project', UserSchema);