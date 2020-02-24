var Admin = require('../models/admin');
var localStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var passport = require('passport');
// const validator = require('express-validator');

exports.admin_get = function(req, res){
    res.render('adminLogin' , {title: "ADMIN LOGIN PANEL"});
}
exports.admin_post = function(req, res, next){
    passport.use(
        new localStrategy({usernameField: 'email'}, (email, password, done) => {
            //match user
            //console.log(email, password);
            Admin.findOne({email: email})
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
        Admin.findById(id, function(err, user) {
          done(err, user);
        });
      });

    
    passport.authenticate('local', {
        successRedirect: '/admin/home',
        failureRedirect: '/admin',
    })(req, res, next);

};

exports.admin_logout = function(req,res, next){
    req.logout();
    res.redirect('/admin');
}