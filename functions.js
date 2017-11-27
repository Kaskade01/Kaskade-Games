// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
// Project           : Kaskade Games E-commerce Project
// Filename          : functions.js
// Author            : Kaskade
// Date Created      : 20171125
// Purpose           : Contains helper functions for passport and database
//
// Revision History  :
// Date      Author      Ref     Revision (Date in YYYYMMDD)
// YYYYMMDD  [author]    [ref#]  [description]
// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

// ========== NODE IMPORTS ==========
var bcrypt      = require('bcryptjs'),
    mongoose    = require('mongoose'),
    config      = require('./config.js');

var UserSchema = mongoose.Schema({
    email: {
        type: String,
        index: { unique: true }
    },
    password: {
        type: String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err,hash){
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.getUserByUsername = function(username, callback){
    var query = {email: username};
    User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch){
        if(err) throw err;
        callback(null, isMatch);
    })
}