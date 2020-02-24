var express = require('express');
var router = express.Router();
var async = require('async');

//controllers//
var Admin = require('../controllers/admin');
var BlogPost = require('../controllers/blogposts');
var User = require('../controllers/user');

//Models//
var AdminModel = require('../models/admin');
var BlogModel = require('../models/blogposts');
var UserModel = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BN BLOG' });
});

///ADMIN URL///

function authentication(req, res){
  if(req.isAuthenticated()){
    return res;
  }
  res.redirect('/admin')
}
///admin login get url///
router.get('/admin', Admin.admin_get)

///admin login post url///
router.post('/admin', Admin.admin_post);
///admin dashboard url///
router.get('/admin/home', function(req,res){
 
    
    async.parallel({
      blog_post_count: function(callback) {
          BlogModel.countDocuments(callback); // Pass an empty object as match condition to find all documents of this collection
      },
      user: function(callback) {
          UserModel.countDocuments({}, callback);
      },
      admin: function(callback) {
        AdminModel.countDocuments({}, callback);
    },
      
  }, function(err, results) {
      res.render('home', { title: 'BN Blog', error: err, data: results });
  });

})
///admin logout///
router.get('/admin/logout', Admin.admin_logout);


///blog posts get request///
router.get('/admin/blog/:id', BlogPost.blog_detail)
//blog list
router.get('/admin/blog_list', BlogPost.blog_list)
///blog posts create get request///
router.get('/admin/blog_create', BlogPost.blog_create_get)
///blog posts create post request///
router.post('/admin/blog_create', BlogPost.blog_create_post)
///blog posts update get request///
router.get('/admin/blog/:id/update',BlogPost.blog_update_get)
///blog posts update post request///
router.post('/admin/blog/:id/update', BlogPost.blog_update_post)
///blog posts delete get request///
router.get('/admin/blog/:id/delete', BlogPost.blog_delete_get)
///blog posts delete post request///
router.post('/admin/blog/:id/delete', BlogPost.blog_delete_post)
module.exports = router;
