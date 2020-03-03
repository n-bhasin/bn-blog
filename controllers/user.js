var User = require('../models/user');
var localStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var passport = require('passport');
// const validator = require('express-validator');

exports.user_get = function(req, res){
    res.render('userView/user_login' , {title: "USER LOGIN PANEL"});
}
exports.user_post = function(req, res, next){
    passport.use(
        new localStrategy({usernameField: 'email'}, (email, password, done) => {
            //match user
            //console.log(email, password);
            User.findOne({email: email})
            .then(user => {
                
                if(!user){
                    return done(null, false, {message: 'Email is not registered.'});
                }

                //match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if(err) return next(err);
                    if(isMatch){
                        return done(null, user);
                    }
                    else{
                        return done(null, false, {message:'Password does not match.'});
                    }
                })

            })
            .catch(err => console.log(err))
        })
    )
    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });

    
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/userView/user_login',
        failureFlash: true
    })(req, res, next);

};

exports.admin_logout = function(req,res, next){
    req.logout();
    req.flash('success_msg', "You're successfully logged out.");
    res.redirect('/');
}