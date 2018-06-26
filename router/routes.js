var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var request = require('request');
var passport = require('passport');
// var config = require('./config')
var LocalStrategy = require('passport-local').Strategy;
var timestamp = require('time-stamp');
// var FacebookStrategy = require('passport-facebook').Strategy;
// var configAuth = require('../models/auth');
// var controllers = require('../router/controllers/projectdata');
var User = require('../models/user');
var project = require('../models/project');
// var transaction = require('../models/transaction');
var projectdetails = require('../models/projectdetails');
// var profile = require('../models/profile');
var invoice = require('../models/invoice');
var support = require('../models/support');
// var dsupport = require('../models/dsupport');
// var Csupport = require('../models/Csupport');
var nodemailer = require('nodemailer');
var emailCheck = require('email-check');
var crypto = require('crypto');
var http = require('http');

var ejs = require('ejs');
var fs = require('fs');
var multer = require('multer');
// var upload = multer({ dest: 'uplodes' })
// var imgpath = 'img/pending.jpg';
// var xlsxj = require('xlsx-to-json');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        // console.log(file);
        let fileType = file.mimetype.split('/')[1];
        console.log(fileType);
        cb(null, file.fieldname + '-' + file.originalname + '.' + fileType)
        // cb(null, Date.now() + '.jpg') //Appending .jpg
    }
})

var upload = multer({ storage: storage });
 // var upload = multer({ dest: 'uploads/' })
// var HTMLToPDF = require('html5-to-pdf')
// var htmlToPDF = new HTMLToPDF({
//   inputPath: './public/invoice.html',
//   outputPath: 'invoice.pdf',

// })
// htmlToPDF.build((error) => {
//   if(error) throw error

// })



//app/routes.js
// =====================================
// HOME PAGE (with login links) ========
// =====================================
router.get('/logins', function(req, res, next) {
    console.log("123");
    res.render('login.html');
    // {
    //      req.flash('loginMessage')
    // });

    next();
});


// var isLoggedIn = function(req, res, next) {
//   if (req.session && req.session.user)
//     next(); // user logged in, so pass
//   else
//     res.redirect('/'); // not logged in, redirect to login page
// };


// router.post('/isLoggedIn',function(req,res)

// {
//  console.log('isLoggedIn');
//  console.log(req.user);
//     if(req.user){
//         res.json(1);
//     }
//     else
//     {
//         res.json(0);
//     }
// }
// );
function isAuthenticated(req, res, next) {

    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    console.log('12');
    console.log(req.user);
    if (req.user) {
        console.log('12');
        return next();
    }
    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/logins');
}

// console.log("........");
router.get('/registerss', function(req, res, next) {
    console.log(".........");
    res.render('register.html', { message: req.flash('SignupMessage') });
    res.render('register.html');
    console.log("12");
    next();
});

// router.get('Admin.html', function(req, res) {
//     res.render('Admin.html', {
//         message: req.flash('admin message'),
//         user: req.user
//     }); // get the user out of session and pass to template

// });

router.get('/logout', function(req, res) {
    console.log(req.session);
    req.logout();
    req.flash('success', 'You have logged out');
    // req.session.destroy();
    res.redirect('/logins');
});

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    var sessionUser = { 'email': user.email, 'username': user.username }
    // var sessionUser1 = { 'username': user.username }
    done(null, sessionUser);

    console.log(sessionUser);

});

// used to deserialize the user
passport.deserializeUser(function(req, sessionUser, done) {
    //User.findById(, function(err, user) {
    done(null, sessionUser);
});

//register 

router.post('/register', passport.authenticate('local-signup', {
    // console.log(req.body);
    successRedirect: '/logins', // redirect to the secure profile section
    failureRedirect: '/register.html', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));


// signup via passport
passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        emailField: 'email',
        passwordField: 'password',
        // identificationField: 'Devlopers',
        passReqToCallback: true
    },
    function(req, username, email, password) {
        findOrCreateUser = function() {
            // console.log(req.body);
            // find a user in Mongo with provided username
            User.findOne({ 'email': req.body.email }, function(err, user) {
                // In case of any error return
                if (err) {
                    console.log('Error in SignUp: ' + err);
                    return done(err);
                }
                // already exists
                if (user) {
                    console.log('User already exists');
                    // return 
                    //     req.flash('message', 'User Already Exists');
                } else {
                    // if there is no user with that email
                    // create the user
                    var newUser = new User();
                    // set the user's local credentials
                    newUser.username = req.body.username;
                    newUser.email = req.body.email;
                    newUser.password = createHash(req.body.password);
                    newUser.identity = "Developer";


                    // console.log(req.body);
                    // newUser.firstName = req.param('firstName');
                    // newUser.lastName = req.param('lastName');

                    // save the user
                    newUser.save(function(err, user) {
                        if (err && err.name === 'ValidationError') {
                            err.toString().replace('ValidationError: ', '').split(',')
                        }
                        console.log(err);
                        if (user) {
                            console.log(user);
                        }

                        // if successful, return the new user
                        // return done(null, newUser);

                    });
                }
            });
        };

        // Delay the execution of findOrCreateUser and execute 
        // the method in the next tick of the event loop
        process.nextTick(findOrCreateUser);

    }));

var createHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);

}

passport.use('login', new LocalStrategy({
        usernameField: 'email'
    },
    function(email, password, done) {
        console.log("here i am");
        // console.log(req.body);
        User.getUserByUsername(email, function(err, user) {
            console.log(user);
            // console.log(user.email);
            if (err) throw err;
            if (!user) {
                console.log('Unknown User');
                return done(null, false, { message: 'Unknown User' });

            }
            // if (user.identity == "Developer") {
            //     res.redirect('/Developers.html');
            // }
            // console.log(user);
            // console.log(user.identity);
            // return done(null, user);
            console.log(password);
            console.log(user.password);
            User.comparePassword(password, user.password, function(err, isMatch) {

                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    console.log('Invalid Password');
                    return done(null, false, { message: 'Invalid Password' });
                }
            });
            //  global.identity = user.identity;
            // console.log(user.identity);
        });
    }));

router.get('/searchs', function(req, res) {
    fs.readFile('public/search.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        project.find({}, function(err, user) {
            // console.log(user);
            var search_data = [];
            for (var i = 0; i < user.length; i++) {

                var data2 = {};
                data2._id = user[i]._id;
                data2.projectname = user[i].projectname;
                data2.clientname = user[i].clientname;
                data2.TeamMember = user[i].TeamMember;
                data2.technology = user[i].technology;
                data2.Status = user[i].Status;
                search_data.push(data2);

            }
            console.log(search_data);
            res.render('search.html', { search_data: search_data });
            // res.end();
        });
    });
});


router.post('/search', function(req, res) {
    console.log(req.body);
    project.find({
        projectname: req.body.projectname
    }, function(err, user) {
        if (err) {
            console.log(err);
        }
        if (user) {
            console.log(user);
        }
    });
    res.redirect('back');
    res.end();
});
router.post('/login', passport.authenticate('login', {
    // successRedirect: '/profile',
    failureRedirect: '/register.html',
    failureFlash: 'Invalid username or password'

}), function(req, res) {
    // console.log(identity);
    // console.log(req.session.passport.user);
    // console.log(user.identity);
    // console.log(req.session.passport.user.email);
    User.find({ email: req.session.passport.user.email }, function(err, data) {
        // var data = user;
        // console.log(err);

        // console.log(data[0].identity);

        if (data[0].identity == "Developer") {
            res.redirect('/Developers');
        } else if (data[0].identity == "Management") {
            res.redirect('/managements');
        } else if (data[0].identity == "Admin") {
            res.redirect('/Admins');
        } else if (data[0].identity == 'Customers') {
            res.redirect('Customers.html')
        } else {
            console.log(err);
        }
    });
});
 



router.get('/Admins', isAuthenticated, function(req, res) {

   fs.readFile('public/Admin.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        project.find({}, function(err, user) {
            var data = [];
            for (var i = 0; i < user.length; i++) {

                console.log(user[i].Status);
                if (user[i].Status == "Incomplete") {
                    var data1 = {};

                    data1._id = user[i]._id;
                    data1.projectname = user[i].projectname;
                    data1.clientname = user[i].clientname;
                    data1.TeamMember = user[i].TeamMember;
                    data1.technology = user[i].technology;
                    data1.Status = user[i].Status;
                    data.push(data1);
                }
            }


            projectdetails.find({}, function(err, user) {
                var task_data = [];
                for (var i = 0; i < user.length; i++) {
                    var data5 = {};
                    data5._id = user[i]._id;
                    data5.projectname = user[i].projectname;
                    data5.task_insert = user[i].task_insert;
                    data5.status = user[i].status;
                    task_data.push(data5);
                }
                // console.log(task_data);

                var modal_data = [];
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < task_data.length; j++) {
                        console.log(data[i].projectname);
                        console.log(task_data[j].projectname);
                        if (task_data[j].projectname == data[i].projectname) {
                            // console.log(task_data[j].projectname);
                            // console.log(data[i].projectname);
                            modal_data1 = {};

                            modal_data1.projectname = task_data[j].projectname;
                            modal_data1.task_insert = task_data[j].task_insert;
                            modal_data1.status = task_data[j].status;
                            modal_data.push(modal_data1);
                            console.log(modal_data1);
                        }
                    }

                }
                // console.log(modal_data);
                User.find({}, function(err, user) {
                    profile_data = [];
                    for (var i = 0; i < user.length; i++) {
                        if (user[i].identity == 'Developer') {
                            profiles = {};
                            profiles.username = user[i].username;
                            profiles.skills = user[i].skills;
                            profiles.phonenumber = user[i].phonenumber;
                            profiles.email = user[i].email;
                            profiles.address = user[i].address;
                            profile_data.push(profiles);
                        }
                       
                    }
                     image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Admin'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
                    // console.log(profile_data);
                    var modal_data1 = [];
                    for (var i = 0; i < data.length; i++) {
                        for (var j = 0; j < profile_data.length; j++) {
                            console.log(data[i].TeamMember);
                            console.log(profile_data[j].username);
                            if (profile_data[j].username == data[i].TeamMember) {
                                // console.log(task_data[j].projectname);
                                // console.log(data[i].projectname);
                                modal_data2 = {};

                                modal_data1.projectname = profile_data[j].username;
                                modal_data1.phonenumber = profile_data[j].phonenumber;
                                modal_data1.email = profile_data[j].email;
                                modal_data1.address = profile_data[j].address;
                                modal_data1.push(modal_data2);

                            }
                        }

                    }
                    console.log(modal_data1);
                    res.render('Admin.html', {image:image, data: data, task_data: task_data, profile_data: profile_data, modal_data: modal_data, modal_data1: modal_data1 });
                    // res.end();
                });
            });
        });
    });
});


router.get('/managements', isAuthenticated, function(req, res) {
    console.log("management");
    fs.readFile('public/management.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        project.find({}, function(err, user) {
            var data = [];
            for (var i = 0; i < user.length; i++) {

                console.log(user[i].Status);
                if (user[i].Status == "Incomplete") {
                    var data1 = {};

                    data1._id = user[i]._id;
                    data1.projectname = user[i].projectname;
                    data1.clientname = user[i].clientname;
                    data1.TeamMember = user[i].TeamMember;
                    data1.technology = user[i].technology;
                    data1.Status = user[i].Status;
                    data.push(data1);
                }
            }


            projectdetails.find({}, function(err, user) {
                var task_data = [];
                for (var i = 0; i < user.length; i++) {
                    var data5 = {};
                    data5._id = user[i]._id;
                    data5.projectname = user[i].projectname;
                    data5.task_insert = user[i].task_insert;
                    data5.status = user[i].status;
                    task_data.push(data5);
                }
                // console.log(task_data);

                var modal_data = [];
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < task_data.length; j++) {
                        console.log(data[i].projectname);
                        console.log(task_data[j].projectname);
                        if (task_data[j].projectname == data[i].projectname) {
                            // console.log(task_data[j].projectname);
                            // console.log(data[i].projectname);
                            modal_data1 = {};

                            modal_data1.projectname = task_data[j].projectname;
                            modal_data1.task_insert = task_data[j].task_insert;
                            modal_data1.status = task_data[j].status;
                            modal_data.push(modal_data1);
                            console.log(modal_data1);
                        }
                    }

                }
                // console.log(modal_data);
                User.find({}, function(err, user) {
                    profile_data = [];
                    for (var i = 0; i < user.length; i++) {
                        if (user[i].identity == 'Developer') {
                            profiles = {};
                            profiles.username = user[i].username;
                            profiles.skills = user[i].skills;
                            profiles.phonenumber = user[i].phonenumber;
                            profiles.email = user[i].email;
                            profile_data.push(profiles);
                        }
                       
                    }
                     image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Management'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
                    // console.log(profile_data);
                    var modal_data1 = [];
                    for (var i = 0; i < data.length; i++) {
                        for (var j = 0; j < profile_data.length; j++) {
                            console.log(data[i].TeamMember);
                            console.log(profile_data[j].username);
                            if (profile_data[j].username == data[i].TeamMember) {
                                // console.log(task_data[j].projectname);
                                // console.log(data[i].projectname);
                                modal_data2 = {};

                                modal_data1.projectname = profile_data[j].username;
                                modal_data1.phonenumber = profile_data[j].phonenumber;
                                modal_data1.email = profile_data[j].email;
                                modal_data1.push(modal_data2);

                            }
                        }

                    }
                    console.log(modal_data1);
                    res.render('management.html', {image:image, data: data, task_data: task_data, profile_data: profile_data, modal_data: modal_data, modal_data1: modal_data1 });
                    // res.end();
                });
            });
        });
    });
});

router.post('/management', function(req, res){
    console.log("my project status is here");
      console.log(req.body);
       if(req.body.status1 == "Incomplete"){
             var query = { Status: 'Incomplete' };
      
         var update = {
             Status: "Complete",
    //         // imgpath: "img/pending.jpg"
         };

     } else if (req.body.status1 == "Complete") {
         var query = { Status: 'Incomplete' };
         var update = {
             Status: "Incomplete",
    //         // imgpath: "img/complete.png"
         };

    }
    var options = { new: true, upsert: false };
    project.findOneAndUpdate(query, update, options, function(err, user) {
        if (err) {
            console.log(err);
        }
        if (user) {
            console.log(user);
            res.send({ message: 'true' });
        }
        // res.redirect('http://localhost:3000/Dprojectsdetails');   
        // res.end();         

    });
});
router.get('/Developers', isAuthenticated, function(req, res) {

   fs.readFile('public/Developers.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        project.find({}, function(err, user) {
            var data = [];
            for (var i = 0; i < user.length; i++) {

                console.log(user[i].Status);
                if (user[i].Status == "Incomplete") {
                    var data1 = {};

                    data1._id = user[i]._id;
                    data1.projectname = user[i].projectname;
                    data1.clientname = user[i].clientname;
                    data1.TeamMember = user[i].TeamMember;
                    data1.technology = user[i].technology;
                    data1.Status = user[i].Status;
                    data.push(data1);
                }
            }


            projectdetails.find({}, function(err, user) {
                var task_data = [];
                for (var i = 0; i < user.length; i++) {
                    var data5 = {};
                    data5._id = user[i]._id;
                    data5.projectname = user[i].projectname;
                    data5.task_insert = user[i].task_insert;
                    data5.status = user[i].status;
                    task_data.push(data5);
                }
                // console.log(task_data);

                var modal_data = [];
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < task_data.length; j++) {
                        console.log(data[i].projectname);
                        console.log(task_data[j].projectname);
                        if (task_data[j].projectname == data[i].projectname) {
                            // console.log(task_data[j].projectname);
                            // console.log(data[i].projectname);
                            modal_data1 = {};

                            modal_data1.projectname = task_data[j].projectname;
                            modal_data1.task_insert = task_data[j].task_insert;
                            modal_data1.status = task_data[j].status;
                            modal_data.push(modal_data1);
                            console.log(modal_data1);
                        }
                    }

                }
                // console.log(modal_data);
                User.find({}, function(err, user) {
                    profile_data = [];
                    for (var i = 0; i < user.length; i++) {
                        if (user[i].identity == 'Developer') {
                            profiles = {};
                            profiles.username = user[i].username;
                            profiles.skills = user[i].skills;
                            profiles.phonenumber = user[i].phonenumber;
                            profiles.email = user[i].email;
                            profile_data.push(profiles);
                        }
                       
                    }
                     image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Admin'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
                    // console.log(profile_data);
                    var modal_data1 = [];
                    for (var i = 0; i < data.length; i++) {
                        for (var j = 0; j < profile_data.length; j++) {
                            console.log(data[i].TeamMember);
                            console.log(profile_data[j].username);
                            if (profile_data[j].username == data[i].TeamMember) {
                                // console.log(task_data[j].projectname);
                                // console.log(data[i].projectname);
                                modal_data2 = {};

                                modal_data1.projectname = profile_data[j].username;
                                modal_data1.phonenumber = profile_data[j].phonenumber;
                                modal_data1.email = profile_data[j].email;
                                modal_data1.push(modal_data2);

                            }
                        }

                    }
                    console.log(modal_data1);
                    res.render('Developers.html', {image:image, data: data, task_data: task_data, profile_data: profile_data, modal_data: modal_data, modal_data1: modal_data1 });
                    // res.end();
                });
            });
        });
    });
});
//here admin project list..
router.get('/Aprojects', isAuthenticated, function(req, res) {

    fs.readFile('public/Aproject.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        User.find({}, function(err, user) {
            var data3 = [];
            for (var i = 0; i < user.length; i++) {
                if (user[i].identity == 'Customers') {
                    var data2 = {};
                    data2._id = user[i]._id;
                    data2.username = user[i].username;

                    data3.push(data2);

                }
            }
              image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Admin'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
            // console.log(data3)
            var developer = [];
            for (var i = 0; i < user.length; i++) {
                if (user[i].identity == 'Developer') {
                    var data1 = {};
                    data1._id = user[i]._id;
                    data1.username = user[i].username;

                    developer.push(data1);

                }
            }
            res.render('Aproject.html', { developer: developer, data3: data3, image: image });
            // res.end();
        });
    });
});

router.post('/Aproject', isAuthenticated, function(req, res) {
    console.log(req.body);
    var projectdata = new project();
    // var file = __dirname + req.file.filename;
    // projectdata.file = req.file.filename;
    projectdata.projectname = req.body.projectname;
    projectdata.createdate = req.body.createdate;
    projectdata.description = req.body.description;
    projectdata.submitdate = req.body.submitdate;
    projectdata.TeamMember = req.body.TeamMember;
    projectdata.clientname = req.body.clientname;
    projectdata.technology = req.body.technology;

    projectdata.save(function(err, user) {
        if (user) {
            console.log(user);
        }
    });


    res.redirect('/Aprojects');

    res.end();
});

router.get('/projectlists', isAuthenticated, function(req, res) {
    fs.readFile('public/projectlist.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        User.find({}, function(err, user) {
            var data3 = [];
            for (var i = 0; i < user.length; i++) {
                if (user[i].identity == 'Customers') {
                    var data2 = {};
                    data2._id = user[i]._id;
                    data2.username = user[i].username;

                    data3.push(data2);

                }
            }
              image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Admin'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
            console.log(data3)
            var developer = [];
            for (var i = 0; i < user.length; i++) {
                if (user[i].identity == 'Developer') {
                    var data1 = {};
                    data1._id = user[i]._id;
                    data1.username = user[i].username;

                    developer.push(data1);

                }
            }
            project.find({}, function(err, user) {


                var data = [];


                for (var i = 0; i < user.length; i++) {
                    var data1 = {};
                    data1._id = user[i]._id;
                    data1.projectname = user[i].projectname;
                    data1.createdate = user[i].createdate;
                    data1.TeamMember = user[i].TeamMember;
                    data1.submitdate = user[i].submitdate;
                    data1.description = user[i].description;
                    data1.clientname = user[i].clientname;
                    data1.technology = user[i].technology;
                    data1.Status = user[i].Status;
                    data.push(data1);

                }
                console.log(data);
                console.log(data.length);
                console.log(data3);
                res.render('projectlist.html', { data: data, developer: developer, data3: data3, image: image });
            });
        });
    });
});

router.post('/projectlist', function(req, res) {
    console.log(req.body);

    if (req.body.projectid != undefined) {

        query = { _id: req.body.projectid };
        update = {
            '$set': {
                projectname: req.body.projectname,
                createdate: req.body.createdate,
                Status: req.body.Status,
                description: req.body.description,
                // clientname: req.body.clientname,
            }
        };
        options = { new: true, upsert: true };
        project.findOneAndUpdate(query, update, options, function(err, user) {
            if (err) throw err;
            console.log(err);
            console.log(user);
        });
    }
    res.redirect('/projectlists');

    res.end();
});


router.get('/Dprojects', isAuthenticated, function(req, res) {

    // console.log(req.session);
    // console.log(user);
    // console.log("12");
    // http.createServer(function(req, res) {
    //     res.writeHead(200, { 'Content-Type': 'text/html' });

    //since we are in a request handler function
    //we're using readFile instead of readFileSync
    fs.readFile('public/Dprojects.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        // console.log(user);

        User.find({email: req.session.passport.user.email}, function(err, user) {
           
              image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Developer'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
        project.find({}, function(err, user) {

            console.log(user);
            // console.log(user[0].projectname);

            var data = user;
            console.log(data.length);


            res.render('Dprojects.html', { data: data, image: image });
            // var renderedHtml  = ejs.render(content, { data: JSON.stringify( data )} );
            // var renderedHtml = ejs.render(content, { projectname: data[0].projectname , createdate : data[0].createdate, status : data[0].status});
            // res.end(renderedHtml);
        });
    });
     });
});
router.get('/Cproject', isAuthenticated, function(req, res) {
    fs.readFile('public/Cprojects.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
         User.find({email: req.session.passport.user.email}, function(err, user) {
           
              image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Developer'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
        // console.log(user);
        project.find({email: req.session.passport.user.email}, function(err, user) {

            console.log(user);
            // console.log(user[0].projectname);

            var data = user;
            console.log(data.length);


            res.render('Cprojects.html', { data: data, image: image });

        });
    });
    });
});
router.get('/Ainvoices', isAuthenticated, function(req, res) {
    // res.sendFile(__dirname + "/uploads");
    fs.readFile('public/Ainvoice.html', 'utf-8', function(err, content) {
        if (err) {
            // console.log(err);
            res.end('error occurred');

            return;
        }
        User.find({}, function(err, user) {
            console.log(user);
            var data3 = [];
            for (var i = 0; i < user.length; i++) {
                var data2 = {};
                // console.log(user[i].email);
                if (user[i].identity == "Customers") {
                    // console.log(user[i].email);
                    data2.clientname = user[i].username;
                    data3.push(data2);

                }

            }
             image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Admin'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }

            console.log(data3);
            project.find({}, function(err, user) {

                // console.log(user);

                // console.log(user.length);
                var data = [];


                for (var i = 0; i < user.length; i++) {
                    var data1 = {};
                    data1._id = user[i]._id;
                    data1.projectname = user[i].projectname;
                    // data1.createdate = user[i].createdate;
                    // data1.TeamMember = user[i].TeamMember;
                    // data1.description = user[i].description;
                    // data1.clientname = user[i].clientname;
                    data.push(data1);

                }
                console.log(data);

                // console.log(data3);
                res.render('Ainvoice.html', { data: data, data3: data3, image: image });
            });
        });
    });
});

router.post('/Ainvoice', upload.single('file'), function(req, res) {
    console.log(req.body);
    var invoicedata = new invoice();
    var file = __dirname + req.file.filename;
    invoicedata.file = req.file.filename;
    invoicedata.projectname = req.body.projectname;
    invoicedata.clientname = req.body.clientname;
    invoicedata.date = req.body.date;


    invoicedata.save(function(err, user) {
        if (err) {
            // console.log(err);

        }
        if (user) {
            console.log(user);
        }
    });


    // }


    // console.log(req.myfile);

    res.redirect('/Ainvoices');
    res.end();

});
router.get('/Cinvoices', isAuthenticated, function(req, res) {

    fs.readFile('public/Cinvoice.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        // User.find({}, function(req, res){
       User.find({ email: req.session.passport.user.email }, function(err, user) {
           image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Customer'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
        // });
        console.log(req.session.passport.user.username);
        invoice.find({ clientname: req.session.passport.user.username }, function(err, user) {

            // console.log(user);


            // console.log(user.date);
            // console.log(user.length);
            var data = [];

            for (var i = 0; i < user.length; i++) {
                var data1 = {};
                data1._id = user[i]._id;
                data1.file = user[i].file;
                data1.clientname = user[i].clientname;
                // data1.projectname = user[i].projectname;
                // data1.date = user[i].date;
                data.push(data1);

            }
            // console.log(data);
            // console.log(data1.itemname[0]);
            // var data2= [];
            //  data3 = data1.itemname


            res.render('Cinvoice.html', { data: data, data1: data1, image: image });
            // res.end();
        });
    });
});
});

router.get('/Invoicelists', isAuthenticated, function(req, res) {
    fs.readFile('public/Invoicelist.html', 'utf-8', function(err, content) {
        if (err) {
            // console.log(err);
            res.end('error occurred');

            return;
        }
          User.find({ email: req.session.passport.user.email }, function(err, user) {
           image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Admin'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
        invoice.find({}, function(err, user) {


            var data = [];

            for (var i = 0; i < user.length; i++) {
                var data1 = {};
                data1._id = user[i]._id;
                data1.file = user[i].file;
                data1.clientname = user[i].clientname;
                data1.projectname = user[i].projectname;
                data1.date = user[i].date;

                data.push(data1);
            }
            // console.log(data);
            res.render('Invoicelist.html', { data: data, data1: data1, image: image });
            // res.end();
        });
    });

});
});
router.post('/Invoicelist', function(req, res) {
    console.log(req.body);
    console.log(req.body.projectname);
    console.log(req.body.clientid);
    if (req.body.clientid != undefined) {
        // var data = new invoice();
        // data.projectname = req.body.projectname;
        // data.clientname = req.body.clientname;
        // data.date = req.body.date;

        // data.save(function(err, user){
        //      if(user){
        //         console.log(user);
        //      }
        // });
        var query = { _id: req.body.clientid };
        console.log('12');
        var update = {
            $set: {
                // file: req.body.file,
                projectname: req.body.projectname,
                clientname: req.body.clientname,
                date: req.body.date,

            }
        };

        var options = { new: true, upsert: true };
        invoice.findOneAndUpdate(query, update, options, function(err, user) {
            if (err) throw err;
            // console.log(err);
            console.log(user);
        });
    }
    res.redirect('/Invoicelists');
    res.end();
});

router.get('/Aprojectsdetails', isAuthenticated, function(req, res) {
    fs.readFile('public/task.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        User.find({}, function(err, user) {
            data4 = [];
            for (var i = 0; i < user.length; i++) {
                developer = {};
                if (user[i].identity == 'Developer') {
                    developer.username = user[i].username;
                    data4.push(developer);
                }
            }
             image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Admin'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
            console.log(data4);

            project.find({}, function(err, user) {
                data = [];
                for (var i = 0; i < user.length; i++) {
                    data1 = {};
                    data1.projectname = user[i].projectname;
                    data.push(data1);
                }
                console.log(data);
                // projectdetails.find({}, function(err, user) {
                //        taskdata = [];
                //        for (var i = 0; i < user.length; i++){
                //           data2 = {};
                //           data2.username = user[i].username;
                //           data2.projectname = user[i].projectname;
                //           data2.task_insert = user[i].task_insert;
                //          data2.status = user[i].status;
                //          data2.imgpath = user[i].imgpath;
                //           taskdata.push(data2);
                //        }
                //        console.log(taskdata);
                projectdetails.find({}, function(err, user) {
                    taskdata1 = [];
                    for (var i = 0; i < user.length; i++) {
                        if (user[i].status == "Uncomplete") {
                            data3 = {};
                            data3.username = user[i].username;
                            data3.projectname = user[i].projectname;
                            data3.task_insert = user[i].task_insert;
                            data3.status = user[i].status;
                            data3.imgpath = user[i].imgpath;
                            taskdata1.push(data3);
                        }
                    }
                    console.log(taskdata1);

                    res.render('task.html', { data: data, taskdata1: taskdata1, image: image });
                });
            });
        });
    });
});
router.post('/task', function(req, res) {
    console.log("body:", req.body);
    // project.find({projectname : req.body.projectname}{
    var task = new projectdetails();
    task.username = req.body.username;
    task.projectname = req.body.projectname;
    task.task_insert = req.body.task_insert;
    task.status = "Uncomplete";
    task.imgpath = "img/pending.jpg";
    task.save(function(err, user) {
        if (err) throw err;
        // console.log(err);
        console.log(user);
    });
    res.redirect('task.html');
    res.end();
});
router.get('/Dprojectsdetails', isAuthenticated, function(req, res) {
    // console.log('1234');
    fs.readFile('public/Dprojectdetails.html', 'utf-8', function(err, content) {
        // console.log('problem');
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        // console.log(req.session);
        projectdetails.find({ username: req.session.passport.user.username }, function(err, user) {

            // console.log(user);
            var data = [];


            for (var i = 0; i < user.length; i++) {
                var data1 = {};
                // data1._id = user[i]._id;
                data1.projectname = user[i].projectname;
                data1.username = user[i].username;
                data1.task_insert = user[i].task_insert;
                data1.status = user[i].status;
                data1._id = user[i]._id;
                data1.imgpath = user[i].imgpath;
                data.push(data1);

            }
            // console.log(data);

            res.render('Dprojectdetails.html', { data: data });
        });
    });
});

router.post('/Dprojectdetails', function(req, res) {
    // console.log('123');
    console.log(req.body);

    if (req.body.status == "complete") {
        var query = { status: 'complete' };
        var update = {
            status: "Uncomplete",
            imgpath: "img/pending.jpg"
        };

    } else if (req.body.status == "Uncomplete") {
        var query = { status: 'Uncomplete' };
        var update = {
            status: "complete",
            imgpath: "img/complete.png"
        };

    }
    var options = { new: true, upsert: false };
    projectdetails.findOneAndUpdate(query, update, options, function(err, user) {
        if (err) {
            console.log(err);
        }
        if (user) {
            console.log(user);
            res.send({ message: 'true' });
        }
        // res.redirect('http://localhost:3000/Dprojectsdetails');   
        // res.end();         

    });
});

// }    



router.get('/Aprofiles', function(req, res) {
     fs.readFile('public/Invoicelist.html', 'utf-8', function(err, content) {
        if (err) {
            // console.log(err);
            res.end('error occurred');

            return;
        }
          User.find({ email: req.session.passport.user.email }, function(err, user) {
           image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Admin'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
                  var data = [];


            for (var i = 0; i < user.length; i++) {

                var data1 = {};
                data1.file = user[i].file;
               data1.username = user[i].username;
               data1.email = user[i].email;
               data1.password = user[i].password;
               data1.confirmpassword = user[i].confirmpassword;
               data1.dof = user[i].dof;
               data1.address = user[i].address;
               data1.phonenumber = user[i].phonenumber;
               data1.skills = user[i].skills;
               data1.validpassword = user[i].validpassword;                
               data.push(data1);

            }   
    res.render('Aprofile.html', {image: image, data: data1});
});
});
});          

router.get('/dprofiles',isAuthenticated, function(req, res) {

   fs.readFile('public/dprofile.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        console.log(req.session.passport.user.email);
        User.find({email: req.session.passport.user.email }, function(err, user) {

            // console.log(user);
            var data = [];


            for (var i = 0; i < user.length; i++) {

                var data1 = {};
                data1.file = user[i].file;
               data1.username = user[i].username;
               data1.email = user[i].email;
               data1.password = user[i].password;
               data1.confirmpassword = user[i].confirmpassword;
               data1.dof = user[i].dof;
               data1.address = user[i].address;
               data1.phonenumber = user[i].phonenumber;
               data1.skills = user[i].skills;
               data1.validpassword = user[i].validpassword;                
               data.push(data1);

            }
                  image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Developer'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
            res.render('dprofile.html', {data: data, image: image});
        });
    });
});
router.get('/Cprofiles', isAuthenticated, function(req, res) {
       fs.readFile('public/Cprofile.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        // console.log(req.session);
        User.find({ email: req.session.passport.user.email }, function(err, user) {

            // console.log(user);
            var data = [];


            for (var i = 0; i < user.length; i++) {
                var data1 = {};
                data1.file = user[i].file;
               data1.username = user[i].username;
               data1.email = user[i].email;
               data1.password = user[i].password;
               data1.confirmpassword = user[i].confirmpassword;
               data1.dof = user[i].dof;
               data1.address = user[i].address;
               data1.phonenumber = user[i].phonenumber;
               data1.skills = user[i].skills;
               data1.validpassword = user[i].validpassword;                
               data.push(data1);

            }
                  image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Customer'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
            res.render('Cprofile.html', {data: data, image: image});
        });
    });
});
  
router.get('/MAprofiles', isAuthenticated, function(req, res) {
    fs.readFile('public/MAprofile.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        // console.log(req.session);
        User.find({ email: req.session.passport.user.email }, function(err, user) {

            // console.log(user);
            var data = [];


            for (var i = 0; i < user.length; i++) {
                var data1 = {};
                data1.file = user[i].file;
               data1.username = user[i].username;
               data1.email = user[i].email;
               data1.password = user[i].password;
               data1.confirmpassword = user[i].confirmpassword;
               data1.dof = user[i].dof;
               data1.address = user[i].address;
               data1.phonenumber = user[i].phonenumber;
               data1.skills = user[i].skills;
               data1.validpassword = user[i].validpassword;                
               data.push(data1);

            }
                  image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Management'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
            res.render('MAprofile.html', {data: data, image: image});
        });
    });
});

router.post('/profile', upload.single('file'), function(req, res) {
    console.log(req.body);
    //     console.log(req.session.passport.user);
     var file = __dirname + req.file.path;
     console.log(req.file);
    var query = { email: req.body.email };
    var update = {
        '$set': {
            file: req.file.path,
            username: req.body.username,
            email: req.body.email,
            password: createHash(req.body.password),
            validpassword: req.body.password,
            confirmpassword: req.body.confirmpassword,
            dof: req.body.dof,
            address: req.body.address,
            phonenumber: req.body.phonenumber,
            skills: req.body.skills,
        }
    };
    var options = { new: true, upsert: true };
    User.findOneAndUpdate(query, update, options, function(err, user) {
        if (err) throw err;
        console.log(err);
    });
    res.redirect('back');
    res.end('successfully save');
});


router.get('/Addclients', isAuthenticated, function(req, res) {
    fs.readFile('public/Addclient.html', 'utf-8', function(err, content) {
        if (err) {
            // console.log(err);
            res.end('error occurred');

            return;
        }
          User.find({ email: req.session.passport.user.email }, function(err, user) {
           image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Admin'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }


    res.render('Addclient.html', {image: image});
});
      });
});
router.get('/MAddclients', isAuthenticated, function(req, res) {
  fs.readFile('public/MAddclient.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        // console.log(req.session);
        User.find({ email: req.session.passport.user.email }, function(err, user) {
           image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Management'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }

    res.render('MAddclient.html', {image: image});
});
});
});

router.post('/Addclient', function(req, res) {
    console.log(req.body);
    // console.log(req.session.passport.user);
    User.findOne({ email: req.session.passport.user.email }, function(err, user) {
        if (err) {
            console.log(err);
        }
        if (user) {

            // console.log(user);
            var addclient = new User();
            addclient.username = req.body.username;
            addclient.gmail = req.body.gmail;
            addclient.email = req.body.email;
            var randomstring = Math.random().toString(36).slice(-8);
            addclient.password = createHash(randomstring);
            addclient.identity = 'Customers';
            // addclient.clientpassword = randomstring;
            addclient.validpassword = randomstring;
            // console.log(randomstring);

            addclient.save(function(err, user) {
                if (err) {
                    console.error('ERROR!');

                }
                if (user) {
                    console.log(user);
                    // User.find().sort({username : 1}).distinct('user.username')

                    // var createHash = function(password) {
                    //     return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
                    // }
                    var smtpTransport = nodemailer.createTransport({
                        // address: '127.0.0.1',
                        service: 'Gmail',
                        // host: 'smtp.appwallaz.com',
                        // port: 587,
                        auth: {
                            user: 'usergarg3@gmail.com',
                            pass: '12345pass'
                        }
                    });

                    var fromemailadd = "Nimisha@appwallaz.com";
                    var toemailadd = req.body.gmail;
                    var mailOptions = {
                        from: fromemailadd,
                        to: toemailadd,
                        subject: 'Node.js Password',
                        text: "Hello, client this is your email and password :" + " " + req.body.email + " " + user.validpassword
                    };
                    smtpTransport.sendMail(mailOptions, function(err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }

                    });
                }
            });
        }
    });


    res.redirect('back');
    res.end();
});

router.get('/Adddevelopers', isAuthenticated, function(req, res) {
     fs.readFile('public/Adddeveloper.html', 'utf-8', function(err, content) {
        if (err) {
            // console.log(err);
            res.end('error occurred');

            return;
        }
          User.find({ email: req.session.passport.user.email }, function(err, user) {
           image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Admin'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
    res.render('Adddeveloper.html', {image: image});
});
      });
 });
router.get('/MAdevelopers', isAuthenticated, function(req, res) {
   fs.readFile('public/MAdeveloper.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        // console.log(req.session);
        User.find({ email: req.session.passport.user.email }, function(err, user) {
           image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Management'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }

    res.render('MAdeveloper.html', {image: image});
});
});
});
router.post('/Adddeveloper', function(req, res) {
    console.log(req.body);
    // console.log(req.session.passport.user);
    User.findOne({ email: req.session.passport.user.email }, function(err, user) {
        if (err) {
            console.log(err);
        }
        if (user) {

            // console.log(user);
            var adddeveloper = new User();
            adddeveloper.username = req.body.username;
            adddeveloper.gmail = req.body.gmail;
            adddeveloper.email = req.body.email;
            var randomstring = Math.random().toString(36).slice(-8);
            adddeveloper.password = createHash(randomstring);
            adddeveloper.identity = 'Developer';
            adddeveloper.validpassword = randomstring;
            console.log(randomstring);
            adddeveloper.save(function(err, user) {
                if (err) {
                    console.error('ERROR!');

                }
                if (user) {
                    // console.log(data);
                    var smtpTransport = nodemailer.createTransport({
                        // address: '127.0.0.1',
                        service: 'Gmail',
                        // host: 'smtp.appwallaz.com',
                        // port: 587,
                        auth: {
                            user: 'usergarg3@gmail.com',
                            pass: '12345pass'
                        }
                    });

                    var fromemailadd = "Nimisha@appwallaz.com";
                    var toemailadd = req.body.gmail;
                    var mailOptions = {
                        from: fromemailadd,
                        to: toemailadd,
                        subject: 'Node.js Password',
                        text: "Hello, client this is your email and password :" + " " + req.body.email + " " + user.validpassword
                    };
                    smtpTransport.sendMail(mailOptions, function(err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }

                    });
                }
            });
        }
    });
    // var createHash = function(password) {
    //     return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
    // }

    res.redirect('back');
    res.end();
});


router.get('/Addadmins', isAuthenticated, function(req, res) {
    fs.readFile('public/Addadmin.html', 'utf-8', function(err, content) {
        if (err) {
            // console.log(err);
            res.end('error occurred');

            return;
        }
          User.find({ email: req.session.passport.user.email }, function(err, user) {
           image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Admin'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
    res.render('Addadmin.html', {image: image});
});
      });
});
router.post('/Addadmin', function(req, res) {
    console.log(req.body);
    // console.log(req.session.passport.user);
    User.findOne({ email: req.session.passport.user.email }, function(err, user) {
        if (err) {
            console.log(err);
        }
        if (user) {

            // console.log(user);
            var addadmin = new User();
            addadmin.username = req.body.username;
            addadmin.gmail = req.body.gmail;
            addadmin.email = req.body.email;
            var randomstring = Math.random().toString(36).slice(-8);
            addadmin.password = createHash(randomstring);
            addadmin.identity = 'Management';
            addadmin.validpassword = randomstring;
            console.log(randomstring);
            addadmin.save(function(err, user) {
                if (err) {
                    console.error('ERROR!');

                }
                if (user) {
                    // console.log(data);
                    var smtpTransport = nodemailer.createTransport({
                        // address: '127.0.0.1',
                        service: 'Gmail',
                        // host: 'smtp.appwallaz.com',
                        // port: 587,
                        auth: {
                            user: 'usergarg3@gmail.com',
                            pass: '12345pass'
                        }
                    });

                    var fromemailadd = "Nimisha@appwallaz.com";
                    var toemailadd = req.body.gmail;
                    var mailOptions = {
                        from: fromemailadd,
                        to: toemailadd,
                        subject: 'Node.js Password',
                        text: "Hello, client this is your email and password :" + " " + req.body.email + " " + user.validpassword
                    };
                    smtpTransport.sendMail(mailOptions, function(err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }

                    });
                }
            });
        }
    });
    // var createHash = function(password) {
    //     return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
    // }

    res.redirect('/Addadmins');
    res.end();
});

router.get('/supports', isAuthenticated, function(req, res) {
    //for admin outbox...
    fs.readFile('public/support.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        // console.log(user);
         User.find({ email: req.session.passport.user.email }, function(err, user) {
           image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Admin'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
        // console.log(user);
        // console.log(req.session);
        support.find({ sender: req.session.passport.user.email }, function(err, user) {

            // console.log(user);
            // console.log(user[0].projectname);
            chatdata = [];
            for (i = 0; i < user.length; i++) {
                var chatdata1 = {};
                if (user[i].sender == req.session.passport.user.email) {
                    chatdata1.receiver = user[i].receiver;
                    chatdata1.username = user[i].username;
                    chatdata1.message = user[i].message;
                    // chatdata1.file = user[i].file;
                    chatdata.push(chatdata1);
                }
            }

            // console.log(chatdata);


            // console.log(user);
            support.find({ receiver: req.session.passport.user.email }, function(err, user) {

                // console.log(user);
                // console.log(user[0].projectname);
                ChatData = [];

                for (i = 0; i < user.length; i++) {
                    var chatdata2 = {};


                    chatdata2.receiver = user[i].receiver;
                    chatdata2.username = user[i].username;
                    chatdata2.message = user[i].message;
                    chatdata2.sender = user[i].sender;
                    // chatdata2.file = user[i].file;
                    ChatData.push(chatdata2);
                }

                // console.log(ChatData);
                res.render('support.html', { ChatData: ChatData, chatdata: chatdata, image: image });

            });
        });

    });
});
});
router.get('/MAsupports', isAuthenticated, function(req, res) {
    //for admin outbox...
    fs.readFile('public/support.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
          User.find({ email: req.session.passport.user.email }, function(err, user) {
           image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Management'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }


        console.log(req.session);
        support.find({ sender: req.session.passport.user.email }, function(err, user) {
            chatdata = [];
            for (i = 0; i < user.length; i++) {
                var chatdata1 = {};
                if (user[i].sender == req.session.passport.user.email) {
                    chatdata1.receiver = user[i].receiver;
                    chatdata1.username = user[i].username;
                    chatdata1.message = user[i].message;
                    // chatdata1.file = user[i].file;
                    chatdata.push(chatdata1);
                }
            }

            console.log(chatdata);
            // console.log(user);
            support.find({ receiver: req.session.passport.user.email }, function(err, user) {
                ChatData = [];

                for (i = 0; i < user.length; i++) {
                    var chatdata2 = {};


                    chatdata2.receiver = user[i].receiver;
                    chatdata2.username = user[i].username;
                    chatdata2.message = user[i].message;
                    chatdata2.sender = user[i].sender;
                    // chatdata2.file = user[i].file;
                    ChatData.push(chatdata2);
                }

                // console.log(ChatData);
                res.render('MAsupport.html', { ChatData: ChatData, chatdata: chatdata, image: image });

            });
        });

    });
});
});



// for admin message..........
router.post('/support',  function(req, res) {
    console.log(req.body);
     
    console.log(req.body.receiver);
    User.find({ email: req.body.receiver }, function(err, user) {
       
        for (i = 0; i < user.length; i++) {
            var data = {};
            data.email = user[i].email;
            data.username = user[i].username;
            data.identity = user[i].identity;
            // console.log(data);
        }
        console.log(data.identity);
        if (data != undefined) {
            var message = new support();
            // var file = __dirname + req.file.filename;
            message.receiver = req.body.receiver;
            message.message = req.body.message;
            message.username = data.username;
            message.identity = data.identity;
            // message.file = req.file.filename;
            message.sender = req.session.passport.user.email;

            message.save(function(err, user) {
                if (err) {
                    console.log(err);
                }
                if (user) {
                    console.log(user);
                }
                // chat(user);
            });

        }

        // console.log(data);
        // console.log(req.session.passport.user.identity);
        res.redirect('back');

        res.end();
    });
});

// for developer message....
router.get('/dsupports', isAuthenticated, function(req, res) {
    fs.readFile('public/dsupport.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
         User.find({ email: req.session.passport.user.email }, function(err, user) {
           image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Developer'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
        // console.log(user);
        support.find({ sender: req.session.passport.user.email }, function(err, user) {

            console.log(user);
            // console.log(user[0].projectname);
            ChatData = [];
            for (i = 0; i < user.length; i++) {

                var chatdata2 = {};
                console.log(user[i].sender);
                if (user[i].sender == req.session.passport.user.email) {
                    chatdata2.receiver = user[i].receiver;
                    chatdata2.username = user[i].username;
                    chatdata2.message = user[i].message;
                    // chatdata2.file = user[i].file;
                    ChatData.push(chatdata2);
                }
            }

            // console.log(ChatData);
            // fs.readFile('public/support.html', 'utf-8', function(err, content) {
            //     if (err) {
            //         console.log(err);
            //         res.end('error occurred');

            //         return;
            //     }
            //     console.log(req.session.passport.user.email);
            //     console.log(req.body.receiver);
            support.find({ receiver: req.session.passport.user.email }, function(err, user) {

                // console.log(user);
                // console.log(req.session.passport.user.email);

                chatdata = [];
                for (i = 0; i < user.length; i++) {
                    var chatdata1 = {};
                    // console.log(req.body.sender);

                    chatdata1.receiver = user[i].receiver;
                    chatdata1.username = user[i].username;
                    chatdata1.message = user[i].message;
                    chatdata1.sender = user[i].sender;
                    // chatdata1.file = user[i].file;

                    chatdata.push(chatdata1);
                    // console.log(chatdata1);
                }

                console.log(chatdata);


                res.render('dsupport.html', { ChatData: ChatData, chatdata: chatdata, image: image });
                // var renderedHtml  = ejs.render(content, { data: JSON.stringify( data )} );
                // var renderedHtml = ejs.render(content, { projectname: data[0].projectname , createdate : data[0].createdate, status : data[0].status});
                // res.end(renderedHtml);

            });

        });
    });
});

});
router.post('/dsupport',  function(req, res) {
    console.log(req.body);
    // var file = __dirname + req.file.filename;
    //  console.log(req.file);

    User.find({ email: req.body.receiver }, function(err, user) {
        // console.log(user);
        // console.log(user.length);
        for (i = 0; i < user.length; i++) {
            var data = {};
            data.email = user[i].email;
            data.username = user[i].username;
            data.identity = user[i].identity;
        }
        console.log(data);
        if (data != undefined) {
            var message = new support();
           
            message.receiver = req.body.receiver;
            message.message = req.body.message;
            message.username = data.username;
            message.sender = req.session.passport.user.email;
            message.identity = data.identity;
            message.save(function(err, user) {
                if (err) {
                    console.log(err);
                }
                if (user) {}

            });

        }
    });

    // console.log(data);
    res.redirect('/dsupports');
    res.end();
});

router.get('/Csupports', isAuthenticated, function(req, res) {
    fs.readFile('public/Csupport.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
         User.find({ email: req.session.passport.user.email }, function(err, user) {
           image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Customer'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
        // console.log(user);
        support.find({ sender: req.session.passport.user.email }, function(err, user) {

            console.log(user);
            // console.log(user[0].projectname);
            ChatData = [];
            for (i = 0; i < user.length; i++) {

                var chatdata2 = {};
                console.log(user[i].sender);
                if (user[i].sender == req.session.passport.user.email) {
                    chatdata2.receiver = user[i].receiver;
                    chatdata2.username = user[i].username;
                    chatdata2.message = user[i].message;
                    // chatdata2.file = user[i].file;
                    ChatData.push(chatdata2);
                }
            }

            // console.log(ChatData);
            // fs.readFile('public/support.html', 'utf-8', function(err, content) {
            //     if (err) {
            //         console.log(err);
            //         res.end('error occurred');

            //         return;
            //     }
            //     console.log(req.session.passport.user.email);
            //     console.log(req.body.receiver);
            support.find({ receiver: req.session.passport.user.email }, function(err, user) {

                // console.log(user);
                // console.log(req.session.passport.user.email);

                chatdata = [];
                for (i = 0; i < user.length; i++) {
                    var chatdata1 = {};
                    // console.log(req.body.sender);

                    chatdata1.receiver = user[i].receiver;
                    chatdata1.username = user[i].username;
                    chatdata1.message = user[i].message;
                    chatdata1.sender = user[i].sender;
                    // chatdata1.file = user[i].file;
                    chatdata.push(chatdata1);
                    // console.log(chatdata1);
                }

                console.log(chatdata);


                res.render('Csupport.html', {  ChatData: ChatData, chatdata: chatdata, image: image });
                // var renderedHtml  = ejs.render(content, { data: JSON.stringify( data )} );
                // var renderedHtml = ejs.render(content, { projectname: data[0].projectname , createdate : data[0].createdate, status : data[0].status});
                // res.end(renderedHtml);

            });

        });
    });
});

});
router.post('/Csupport',  function(req, res) {
    console.log(req.body);
 

    User.find({ email: 'Nimisha@appwallaz.com' }, function(err, user) {
        // console.log(user);
        // console.log(user.length);
        for (i = 0; i < user.length; i++) {
            var data = {};
            data.email = user[i].email;
            data.username = user[i].username;
            data.identity = user[i].identity;
        }
        // console.log(data);
        if (data != undefined) {
            var message = new support();
            message.receiver = 'Nimisha@appwallaz.com';
            message.message = req.body.message;
            message.username = data.username;
            message.sender = req.session.passport.user.email;
            message.identity = data.identity;
            // message.file = req.file.originalname;
            message.save(function(err, user) {
                if (err) {
                    console.log(err);
                }
                if (user) {
                    console.log(user);
                }

            });

        }
    });
    // console.log(data);
    // console.log(req.session.passport.user.identity);
    res.redirect('/Csupports');

    res.end();
});

router.get('/forgot', function(req, res) {
    res.render('forgot.html', {
        user: req.user
    });
});

router.post('/forgot', function(req, res, token) {


    crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        //done(err, token);
        console.log(token);



        var query = { 'gmail': req.body.gmail };
        var update = {
            '$set': {
                resetPasswordToken: token,
                resetPasswordExpires: Date.now() + 3600000 // 1 hour
            }
        };
        var options = { new: true, upsert: true };
        User.findOneAndUpdate(query, update, options, function(err, user) {
            if (!user) {
                req.flash('error', 'No account with that email address exists.');
                return res.redirect('/forgot.html');
            }
            console.log(user);



            console.log('121324242144');
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                //  host: 'smtp.gmail.com',
                //port: 465,
                auth: {
                    user: 'usergarg3@gmail.com',
                    pass: '12345pass'
                }
            });
            var fromemailadd = "Nimisha@appwallaz.com";
            var toemailadd = req.body.gmail;
            var mailOptions = {
                to: toemailadd,
                from: fromemailadd,
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                //req.flash('info', 'An e-mail has been sent to ' + req.body.email + ' with further instructions.');
                res.end('a email has been sent..');
                if (err) {
                    console.log(err);
                }

            });

        });
    });
});


router.get('/reset/:token', function(req, res) {

    // User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    // console.log(req.params.token);
    //  console.log(user);

    //   if (!user) {
    // // console.log('12');
    //     req.flash('error', 'Password reset token is invalid or has expired.');
    //     return res.redirect('/forgot.html');
    //   }
    res.render('reset.html', {
        user: req.user
    });
});
// });


router.post('/reset/:token', function(req, res) {
    console.log(req.params.token);
    var query = { resetPasswordToken: req.params.token };
    var update = {
        password: createHash(req.body.password),
        validpassword: req.body.password,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
    };
    var options = { new: true, upsert: false };
    // console.log(req.params.token);
    User.findOneAndUpdate(query, update, options, function(err, user) {
        if (err) {
            console.log(err);
        }
        // 
        if (!user) {
            req.flash('error', 'token is invalid or expired');
            return res.redirect('/forgot.html');
        } else {
            console.log(user);
            var smtpTransport = nodemailer.createTransport({
                // address: '127.0.0.1',
                service: 'Gmail',
                // host: 'smtp.appwallaz.com',
                // port: 587,
                auth: {
                    user: 'usergarg3@gmail.com',
                    pass: '12345pass'
                }
            });

            var fromemailadd = "Nimisha@appwallaz.com";
            var toemailadd = user.gmail;
            var mailOptions = {
                from: fromemailadd,
                to: toemailadd,
                subject: 'Node.js Password',
                text: "Hello, This is your password after reset :" + " " + user.validpassword
            };
            smtpTransport.sendMail(mailOptions, function(err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Email sent: ' + info.response);
                }

            });




            res.redirect('/logins');
            res.end('a email has been sent..');
        }
    });

    /* async.waterfall([
       function(done) {
         User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
           if (!user) {
             req.flash('error', 'Password reset token is invalid or has expired.');
             return res.redirect('back');
           }

           user.password = req.body.password;
           user.resetPasswordToken = undefined;
           user.resetPasswordExpires = undefined;

           user.save(function(err) {
             req.logIn(user, function(err) {
               done(err, user);
             });
           });
         });
       },
       function(user, done) {
         var smtpTransport = nodemailer.createTransport('SMTP', {
           service: 'SendGrid',
           auth: {
             user: '!!! YOUR SENDGRID USERNAME !!!',
             pass: '!!! YOUR SENDGRID PASSWORD !!!'
           }
         });
         var mailOptions = {
           to: user.email,
           from: 'passwordreset@demo.com',
           subject: 'Your password has been changed',
           text: 'Hello,\n\n' +
             'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
         };
         smtpTransport.sendMail(mailOptions, function(err) {
           req.flash('success', 'Success! Your password has been changed.');
           done(err);
         });
       }
     ], function(err) {
       res.redirect('/');
     });*/
    //   var createHash = function(password) {
    //     return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);

    // }

});

router.get('/MAprojects', isAuthenticated, function(req, res) {

    fs.readFile('public/MAproject.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        User.find({}, function(err, user) {
            var data3 = [];
            for (var i = 0; i < user.length; i++) {
                if (user[i].identity == 'Customers') {
                    var data2 = {};
                    data2._id = user[i]._id;
                    data2.username = user[i].username;

                    data3.push(data2);

                }
            }
              image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Management'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
            // console.log(data3)
            var developer = [];
            for (var i = 0; i < user.length; i++) {
                if (user[i].identity == 'Developer') {
                    var data1 = {};
                    data1._id = user[i]._id;
                    data1.username = user[i].username;

                    developer.push(data1);

                }
            }
            res.render('MAproject.html', { developer: developer, data3: data3, image: image });
            // res.end();
        });
    });
});

router.post('/MAproject', isAuthenticated, function(req, res) {
    console.log(req.body);
    var projectdata = new project();
    // var file = __dirname + req.file.filename;
    // projectdata.file = req.file.filename;
    projectdata.projectname = req.body.projectname;
    projectdata.createdate = req.body.createdate;
    projectdata.description = req.body.description;
    projectdata.submitdate = req.body.submitdate;
    projectdata.TeamMember = req.body.TeamMember;
    projectdata.clientname = req.body.clientname;
    projectdata.technology = req.body.technology;
    projectdata.Status = "Incomplete";


    projectdata.save(function(err, user) {
        if (user) {
            console.log(user);
        }
    });


    res.redirect('/MAprojects');

    res.end();
});

router.get('/MAprojectlists', isAuthenticated, function(req, res) {
    fs.readFile('public/MAprojectlist.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        User.find({}, function(err, user) {
            var data3 = [];
            for (var i = 0; i < user.length; i++) {
                if (user[i].identity == 'Customers') {
                    var data2 = {};
                    data2._id = user[i]._id;
                    data2.username = user[i].username;

                    data3.push(data2);

                }
            }
            image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Management'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
            console.log(data3)
            var developer = [];
            for (var i = 0; i < user.length; i++) {
                if (user[i].identity == 'Developer') {
                    var data1 = {};
                    data1._id = user[i]._id;
                    data1.username = user[i].username;

                    developer.push(data1);

                }
            }
            project.find({}, function(err, user) {


                var data = [];


                for (var i = 0; i < user.length; i++) {
                    var data1 = {};
                    data1._id = user[i]._id;
                    data1.projectname = user[i].projectname;
                    data1.createdate = user[i].createdate;
                    data1.TeamMember = user[i].TeamMember;
                    data1.description = user[i].description;
                    data1.submitdate = user[i].submitdate;
                    data1.clientname = user[i].clientname;
                    data1.technology = user[i].technology;
                    data1.Status = user[i].Status;
                    data.push(data1);

                }
                console.log(data);
                console.log(data.length);
                console.log(data3);
                res.render('MAprojectlist.html', {image:image, data: data, developer: developer, data3: data3 });
            });
        });
    });
});

router.post('/MAprojectlist', function(req, res) {
    console.log(req.body);

    if (req.body.projectid != undefined) {

        query = { _id: req.body.projectid };
        update = {
            '$set': {
                projectname: req.body.projectname,
                createdate: req.body.createdate,
                // TeamMember: req.body.TeamMember,
                description: req.body.description,
                clientname: req.body.clientname,
                Status: req.body.Status,
            }
        };
        options = { new: true, upsert: true };
        project.findOneAndUpdate(query, update, options, function(err, user) {
            if (err) throw err;
            console.log(err);
            console.log(user);
        });
    }
    res.redirect('/MAprojectlists');

    res.end();
});
router.get('/MAtasks', isAuthenticated, function(req, res) {
    fs.readFile('public/MAtask.html', 'utf-8', function(err, content) {
        if (err) {
            console.log(err);
            res.end('error occurred');

            return;
        }
        User.find({}, function(err, user) {
            data4 = [];
            for (var i = 0; i < user.length; i++) {
                developer = {};
                if (user[i].identity == 'Developer') {
                    developer.username = user[i].username;
                    data4.push(developer);
                }
            }
             image= [];
                       for(var i = 0; i < user.length; i++){
                        if(user[i].identity == 'Management'){
                           image1 = {};
                           image1.file = user[i].file;
                           image.push(image1);      
                        }
                    }
            console.log(data4);

            project.find({}, function(err, user) {
                data = [];
                for (var i = 0; i < user.length; i++) {
                    data1 = {};
                    data1.projectname = user[i].projectname;
                    data.push(data1);
                }
                console.log(data);

                projectdetails.find({}, function(err, user) {
                    taskdata1 = [];
                    for (var i = 0; i < user.length; i++) {
                        if (user[i].status == "Uncomplete") {
                            data3 = {};
                            data3.username = user[i].username;
                            data3.projectname = user[i].projectname;
                            data3.task_insert = user[i].task_insert;
                            data3.status = user[i].status;
                            data3.imgpath = user[i].imgpath;
                            taskdata1.push(data3);
                        }
                    }
                    console.log(taskdata1);

                    res.render('MAtask.html', {image:image, data: data, taskdata1: taskdata1 });
                });
            });
        });
    });
});
router.post('/MAtask', function(req, res) {
    console.log("body:", req.body);
    // project.find({projectname : req.body.projectname}{
    var task = new projectdetails();
    task.username = req.body.username;
    task.projectname = req.body.projectname;
    task.task_insert = req.body.task_insert;
    task.status = "Uncomplete";
    task.imgpath = "img/pending.jpg";
    task.save(function(err, user) {
        if (err) throw err;
        // console.log(err);
        console.log(user);
    });
    res.redirect('MAtask.html');
    res.end();
});




module.exports = router;