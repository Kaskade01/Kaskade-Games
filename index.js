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
    //mongojs             = require('mongojs'),
    passport            = require('passport'),
    path                = require('path');

// ========== LOCAL IMPORTS ==========
var config              = require('./config.js'),           // contains private configuration settings
    helpFunctions       = require('./functions.js');        // contains functions for passport and database

// ========== EXPRESS SETUP ==========
var app = express();
app.set('view engine', 'ejs');                              // ejs view engine
app.set('views', path.join(__dirname, '/views'));           // ..

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
app.get('/', function(request, response){                   // HOME - - - - -
    config.DB_PRODUCTS.find(function(err,docs){             // query products
        response.render('index', {                          // render index.ejs
            title: config.TITLE + " - Store",               // pass title
            products: docs                                  // pass products
        });
    });
});

app.get('/about', function(request, response){              // ABOUT - - - - -
    response.render('about', {                              // render about.ejs
        title: config.TITLE + " - About",                   // pass title
    });
});

app.get('/faq', function(request, response){                // FAQ - - - - -
    response.render('faq', {                                // render faq.ejs
        title: config.TITLE + " - FAQ",                     // pass title
    });
});

app.get('/contact', function(request, response){            // CONTACT - - - - -
    response.render('contact', {                            // render contact.ejs
        title: config.TITLE + " - Contact",                 // pass title
    });
});

app.get('/login', function(request, response){              // LOGIN - - - - -
    response.render('login', {                              // render login.ejs
        title: config.TITLE + " - Login",                   // pass title
    });
});

app.get('/cart', function(request, response){               // CART - - - - -
    response.render('cart', {                               // render cart.ejs
        title: config.TITLE + " - Cart",                    // pass title
    });
});

app.get('/admin', function(request, response){               // ADMIN - - - - -
    response.render('admin', {                               // render admin.ejs
        title: config.TITLE + " - Admin",                    // pass title
    });
});

app.get('/admin/products', function(request, response){             // ADMIN PRODUCTS - - - - -
    var id = request.query.sku;                                     // save incoming sku query
    var errors = undefined;                                         // just in case
    if(id === undefined){                                           // show products page if there is no sku query
        config.DB_PRODUCTS.find(function (err,docs){                // Query for all products
            response.render('products', {                           // render products.ejs
                title: config.TITLE + ' - Edit Products',           // pass page title
                products: docs                                      // pass product documents
            });
        });
    } else {                                                        // sku query detected
        config.DB_PRODUCTS.findOne({sku:id},function(err,doc){      // find sku document in DB
            if(!doc){                                               // handle document not found
                console.log("ERROR 100: Could not find " + id + " in database.");
                config.DB_PRODUCTS.find(function(err,docs){         // requery for all products
                    response.render('products', {                   // rerender products page with errors
                        title: config.TITLE + ' - Edit Products',   // pass title
                        products: docs,                             // pass product documents
                        errors: [{msg:"ERROR 100: Could not find " + String(id) + " in database."}]
                    });
                });
            } else if (doc.sku===id){                               // show product page for matching sku
                response.render('editproduct', {                    // render edit product page
                    title:  config.TITLE + ' - Edit ' + String(id), // pass title
                    product: doc                                    // pass product document
                });
            } else {                                                // unknown failure
                console.log("ERROR 114: Could not retrieve product page for " + id)
                response.render('products', {                       // rerender products page with errors
                    title:  config.TITLE + ' - Edit Products',      // pass title
                    products: docs,                                 // pass product documents
                    errors: [{msg:"ERROR 114: Could not retrieve product page for " + String(id)}]
                });
            }
        });
    }
});

// ========== SERVER START ==========
app.listen(config.PORT, function(){
    console.log('Server started on ' + config.PORT + "...");
});