var User = require('../models/user');
var localStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var passport = require('passport');
const validator = require('express-validator');

exports.user_login_get = function(req, res){
    res.render('userView/user_login' , {title: "USER LOGIN PANEL"});
}
exports.user_login_post = function(req, res, next){
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

/// user register form///
exports.user_register_get = function(req, res){
    res.render('userView/user_register' , {title: "USER LOGIN PANEL"});
}
exports.user_register_post = [

    //validate the name field
    validator.body('first_name', 'first name is required!').isLength({min: 1}).trim(),
    validator.body('last_name', 'last name is required!').isLength({min: 1}).trim(),
    validator.body('email', 'email is required!').isLength({min: 1}).trim(),
    validator.body('password', 'password is required!').isLength({min: 1}).trim(),
    //sanitize the name field
    validator.sanitizeBody('*').escape(),

    //process the request
    (req, res,next) => {

        const errors = validator.validationResult(req);

        var newUser = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password
        });

        if(!errors.isEmpty()){
            res.render('user/register', {title: 'Register', user: newUser, errors: errors.array()});
            return ;
        }

        else{
            //data validated

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) return next(err);
                    newUser.password = hash;

                    newUser.save(function(err){
                        if(err) return next(err);
                        req.flash('success_msg', "You're successfully logged in.");
                        res.redirect('/');
                    })
                })
            })
        }
    }
]

exports.user_logout = function(req,res, next){
    req.logout();
    req.flash('success_msg', "You're successfully logged out.");
    res.redirect('/');
}