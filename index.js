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
    cookieParser        = require('cookie-parser'),
    express             = require('express'),
    expressValidator    = require('express-validator'),
    flash               = require('connect-flash'),
    LocalStrategy       = require('passport-local').Strategy,
    passport            = require('passport'),
    path                = require('path'),
    session             = require('express-session');

// ========== LOCAL IMPORTS ==========
var config              = require('./config.js'),           // contains private configuration settings
    User                = require('./functions');        // contains functions for passport and database

// ========== EXPRESS SETUP ==========
var app = express();
app.set('view engine', 'ejs');                              // ejs view engine
app.set('views', path.join(__dirname, '/views'));           // ..

// ========== MIDDLEWARE ==========
app.use(bodyParser.json());                                 // body parser
app.use(bodyParser.urlencoded({extended: false}));          // ..
app.use(cookieParser())                                     // cookie parser
app.use(expressValidator());                                // express validator
app.use(express.static(path.join(__dirname, '/public')));   // static files
app.use(session({                                           // express session
    secret: config.SESS_SECRET,                             // ..
    saveUninitialized: true,                                // ..
    resave: true                                            // ..
}));
app.use(flash());                                           // connect flash
app.use(passport.initialize());                             // passport
app.use(passport.session());                                // ..
app.use(function(req, res, next){                           // global variables
    res.locals.errors = null;                               // ..
    res.locals.success_msg = req.flash('success_msg');      // ..
    res.locals.error_msg = req.flash('error_msg');          // ..
    res.locals.error = req.flash('error');                  // ..
    res.locals.user = req.user || null;
    next();                                                 // ..
});
// LOCK FUNCTION FOR PAGES
function lock(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('error_msg','You are not logged in');
        res.redirect('/login');
    }
}

// ========== ROUTES ==========
app.get('/', function(request, response){                   // HOME - - - - -
    config.DB_PRODUCTS.find(function(err,docs){             // query products
        response.render('index', {                          // render index.ejs
            title: config.TITLE + " - Store",               // pass title
            products: docs,                                 // pass products
            user: request.user                              // ? ? ? ? ?
        });
    });
});

app.get('/about', function(request, response){              // ABOUT - - - - -
    response.render('about', {                              // render about.ejs
        title: config.TITLE + " - About"                    // pass title
    });
});

app.get('/faq', function(request, response){                // FAQ - - - - -
    response.render('faq', {                                // render faq.ejs
        title: config.TITLE + " - FAQ"                      // pass title
    });
});

app.get('/contact', function(request, response){            // CONTACT - - - - -
    response.render('contact', {                            // render contact.ejs
        title: config.TITLE + " - Contact"                  // pass title
    });
});

app.get('/login', function(request, response){              // LOGIN - - - - -
    response.render('login', {                              // render login.ejs
        title: config.TITLE + " - Login"                    // pass title
    });
});

app.get('/cart', function(request, response){         // CART - - - - -
    response.render('cart', {                               // render cart.ejs
        title: config.TITLE + " - Cart"                     // pass title
    });
});

app.get('/logout', function(request, response){              // LOGIN - - - - -
    request.logout();
    request.flash('success_msg', 'You are logged out');
    response.redirect('/login');
});

app.post('/register', function(request, response){          // HANDLE REGISTRATION - - - - -
    var email = request.body.register_user_email,           // save email input
        pass = request.body.register_user_pass,             // save password input
        pass2 = request.body.confirm_user_pass;             // save password confirm input
        // Validation
        request.checkBody('register_user_email', 'Email is required').notEmpty();
        request.checkBody('register_user_email', 'Email is not valid').isEmail();
        request.checkBody('register_user_pass', 'Password is required').notEmpty();
        request.checkBody('confirm_user_pass', 'Passwords do not match').equals(request.body.register_user_pass);
        var errors = request.validationErrors();
        if(errors){
            response.render('login',{
                title: config.TITLE + " - Login",
                errors: errors
            });
        } else {
            var newUser = new User({
                email: email,
                password: pass
            });
            User.createUser(newUser, function(err, user){
                if(err) throw err;
                console.log(user);
            });
            request.flash('success_msg', 'You are registered and can now login');
            response.redirect('/login');
            console.log('Registered: ' + email);
        }
})

// PASSPORT LOGIN STRATEGY - - - - -
passport.use(new LocalStrategy(
    function(username, password, done){
        User.getUserByUsername(username, function(err, user){
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'User does not exist'});
            }
            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
            })
        });
    }
));

// PASSPORT SESSION SERIALIZATION - - - - -
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.getUserById(id, function(err, user){
        done(err, user);
    });
});

// HANDLE LOGIN - - - - -
app.post('/login',
passport.authenticate('local', {successRedirect:'/', failureRedirect:'/login', failureFlash: true}),
function(request, response) {
    resposne.redirect('/');
});

app.get('/admin', lock, function(request, response){              // ADMIN - - - - -
    response.render('admin', {                              // render admin.ejs
        title: config.TITLE + " - Admin"                    // pass title
    });
});

app.get('/admin/products', lock, function(request, response){             // ADMIN PRODUCTS - - - - -
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