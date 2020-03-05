var User = require('../models/user');
var localStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var passport = require('passport');
const {check, validationResult} = require('express-validator/check');

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
    check('first_name', 'first name is required!').isLength({min: 1}).isAlpha().trim()
    .withMessage('Invalid characters in nam field'),
    check('last_name', 'last name is required!').isLength({min: 1}).isAlpha().trim()
    .withMessage('Invalid characters in name field'),
    check('email', 'email is required!').isEmail().trim(),
    check('password', 'password is required!').isLength({min: 1}).trim(),
    //sanitize the name field
    

    //process the request
    (req, res,next) => {
        const errors = validationResult(req);
        
        const {first_name, last_name, email, password} = req.body;
        var newUser = new User({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: password
        });


        if(!errors.isEmpty()){  
            req.flash('error_msg', JSON.stringify(errors.array()[1]["msg"]));        
            res.redirect('register');
            return;
        }

        else{
            //data validated
            User.findOne({email: email})
                .then(user => {
                    if(user){
                        req.flash('error_msg', 'Email is already registered.');
                        res.redirect('register');
                    }
                    else{
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
                });
        }
    }
]

exports.user_logout = function(req,res, next){
    req.logout();
    req.flash('success_msg', "You're successfully logged out.");
    res.redirect('/');
}

