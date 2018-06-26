var express= require('express');
var port= process.env.PORT || 3000;
var app=express();
var path=require('path');
var passport= require('passport');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var LocalStrategy = require('passport-local').Strategy;
var mongoose= require('mongoose');
var flash= require('connect-flash');
var bodyParser= require('body-parser');
var cookieParser= require('cookie-parser');
var session= require('express-session');
var multer = require('multer');

var mongo= require('mongodb');
var url="mongodb://localhost:27017/db";
var db= mongoose.connection;
 var routes = require('./router/routes');
var ejs = require('ejs');

// configuration ===============================================================
 // connect to our database
 app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});
app.set('views', path.join(__dirname, 'public'));

app.engine('.html', ejs.renderFile);
app.set('view engine', 'html');
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/img')));
// app.use(express.static(path.join(__dirname, 'public/img/pending.jpg')));
 // read cookies (needed for auth)
// get information from html forms
// app.set('views', path.join(__dirname, 'uploads'));
app.use("/uploads",express.static(__dirname + '/uploads'));

app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));



// required for passport
app.use(session({ secret:'secret',
    saveUninitialized: true,
    resave: true 
})); 
// session secret
app.use(passport.initialize());
app.use(passport.session()); 
// persistent login sessions
app.use(flash()); 

// use connect-flash for flash messages stored in session
 app.use('/',routes);
// routes ======================================================================
 // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);




console.log('The magic happens on port ' + port);
module.exports = app;