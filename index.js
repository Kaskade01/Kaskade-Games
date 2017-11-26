// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
// Project           : Kaskade Games E-commerce Project
// Filename          : index.js
// Author            : Kaskade
// Date Created      : 20171125
// Purpose           : Entry Point to app. Contains server framework and routes.
//
// Revision History  :
// Date      Author      Ref     Revision (Date in YYYYMMDD)
// YYYYMMDD  [author]    [ref#]  [description]
// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

// ========== NODE IMPORTS ==========
var bodyParser          = require('body-parser'),
    express             = require('express'),
    expressValidator    = require('express-validator'),
    LocalStrategy       = require('passport-local'),
    mongojs             = require('mongojs'),
    passport            = require('passport'),
    path                = require('path');

// ========== LOCAL IMPORTS ==========
var config              = require('./config.js'),     // contains private configuration settings
    helpFunctions       = require('./functions.js');  // contains functions for passport and database

// ========== EXPRESS SETUP ==========
var app = express();
app.set('view engine', 'ejs');                       // ejs view engine
app.set('views', path.join(__dirname, '/views'));    // ..

// ========== MIDDLEWARE ==========
app.use(bodyParser.json());                                 // body parser
app.use(bodyParser.urlencoded({extended: false}));          // ..
app.use(expressValidator());                                // express validator
app.use(express.static(path.join(__dirname, '/public')));   // static files
app.use(function(request, response, next){                  // global variables
    response.locals.errors = null;                          // ..
    next();                                                 // ..
});

// ========== ROUTES ==========
// HOME
app.get('/', function(request, response){
    response.send('ready');
});

// ========== SERVER START ==========
app.listen(config.PORT, function(){
    console.log('Server started on ' + config.PORT + "...");
});