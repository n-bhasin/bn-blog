var express = require('express');
var router = express.Router();
var async = require('async');

//controllers//
var Admin = require('../controllers/admin');
var BlogPost = require('../controllers/blogposts');
var User = require('../controllers/user');
const { ensureAuthenticated } = require('../controllers/ensureauthentication');

//Models//
var AdminModel = require('../models/admin');
var BlogModel = require('../models/blogposts');
var UserModel = require('../models/user');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'BN BLOG' });
// });

///ADMIN URL///

///admin login get url///
router.get('/admin', Admin.admin_get)

///admin login post url///
router.post('/admin', Admin.admin_post);
///admin dashboard url///
router.get('/admin/home', ensureAuthenticated, function(req,res){
 
    async.parallel({
      blog_post_count: function(callback) {
          BlogModel.countDocuments(callback); 
          // Pass an empty object as match condition to find all documents of this collection
      },
      user: function(callback) {
          UserModel.countDocuments({}, callback);
      },
      admin: function(callback) {
        AdminModel.countDocuments({}, callback);
    },
      
  }, function(err, results) {
      res.render('home', { title: 'BN Blog', error: err, data: results, currentUser: req.user.name});
  });

})
///admin logout///
router.get('/admin/logout', ensureAuthenticated,Admin.admin_logout);


///blog posts get request///
router.get('/admin/blog/:id', ensureAuthenticated,BlogPost.blog_detail)
//blog list
router.get('/admin/blog_list', ensureAuthenticated,BlogPost.blog_list)
///blog posts create get request///
router.get('/admin/blog_create', ensureAuthenticated,BlogPost.blog_create_get)
///blog posts create post request///
router.post('/admin/blog_create', ensureAuthenticated,BlogPost.blog_create_post)
///blog posts update get request///
router.get('/admin/blog/:id/update',ensureAuthenticated,BlogPost.blog_update_get)
///blog posts update post request///
router.post('/admin/blog/:id/update',ensureAuthenticated, BlogPost.blog_update_post)
///blog posts delete get request///
router.get('/admin/blog/:id/delete', ensureAuthenticated,BlogPost.blog_delete_get)
///blog posts delete post request///
router.post('/admin/blog/:id/delete',ensureAuthenticated, BlogPost.blog_delete_post)

/** Frontend */
/// blog list get ///
router.get('/', BlogPost.user_blog_list)
/// list of all blogs using pagination///
router.get('/blog/allposts', BlogPost.user_blog_list_allposts)
/// blog detail get///
router.get('/blog/:id', BlogPost.user_blog_detail)
/// blog detail get///
router.post('/blog/:id', BlogPost.user_comment)
///user loginform get ///
// router.get('/user/login', User.user_login_get)
///user loginform post ///
// router.post('/user/login', User.user_login_post)
///user registerform get ///
// router.get('/user/register', User.user_register_get)
///user registerform post ///
router.post('/user/register', BlogPost.user_comment)

module.exports = router;
