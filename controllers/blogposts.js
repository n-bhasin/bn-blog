var Admin = require('../models/admin');
var Blog = require('../models/blogposts');
var User = require('../models/user');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


var async = require('async');


exports.blog_detail = function(req, res){
    
    async.parallel({

        blog: function(callback){
            Blog.findById(req.params.id)
                .populate('author')
                .exec(callback)
        },
        // blog_post: function(callback){
        //     BookInstance.find({'book': req.params.id})
        //     .exec(callback)
        // },
    }, function(err, results){
        if(err) return next(err);
        if(results.blog==null){
            var err = new Error('Blog Post Not Found');
            err.status = 404;
            return next(err);
        }
        //success
        res.render('blog_detail', {
            title: results.blog.title, 
            blog: results.blog
        })
    });
}
exports.blog_list = function(req,res){
    
    Blog.find({}, 'title author description written_date')
        .populate('author')
        .exec(function(err, list_books){
            if(err) return next(err);
            //success
            res.render('blog_list', {title: 'All Blog Posts', book_list:list_books});
        });
};

exports.blog_create_get = function(req,res, next){
    async.parallel({
        admins: function(callback) {
            Admin.find(callback);
        },
        
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('blog_form', { title: 'Create Post', admin: results.admins, blog:results });
    });
}

exports.blog_create_post = [

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('admin', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('description', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('written_date', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    // Sanitize fields (using wildcard).
    sanitizeBody('*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var blogs = new Blog(
          { title: req.body.title,
            author: req.body.admin,
            description: req.body.description,
            writtenby: req.body.blogdate
           });
           console.log(req.body);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Admin.find({'admin': req.params.id})
                    exec(callback);
                },
            
            }, function(err, results) {
                if (err) { return next(err); }

                
                res.render('blog_form', { title: 'Create Blog Post', admin: results.authors, blog: blogs, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            blogs.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new book record.
                   res.redirect('blog_list');
                });
        }
    }
];

exports.blog_update_get = function(req, res, next){
    
    async.parallel({
        blog: function(callback) {
            Blog.findById(req.params.id).populate('author').exec(callback);
        },
        authors: function(callback) {
            Admin.find(callback);
        },
        
        }, function(err, results) {
            console.log(results)
            if (err) { return next(err); }

            if (results.blog==null) { // No results.
                var err = new Error('post not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            
            res.render('blog_form', { title: 'Update Blog Post', admin: results.authors, blog: results.blog });
        });

}


exports.blog_update_post = [

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('admin', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('description', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('written_date', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    // Sanitize fields (using wildcard).
    sanitizeBody('*').escape(),


    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var blogs = new Blog(
            { title: req.body.title,
              author: req.body.admin,
              description: req.body.description,
              writtenby: req.body.blogdate,
              _id:req.params.id
             });
             console.log(req.body);
            
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Admin.find(callback);
                },
                
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('blog_form', { title: 'Update Blog Post', admin: results.authors, blog: blogs, errors: errors.array() });
                
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Blog.findByIdAndUpdate(req.params.id, blogs, {}, function (err,theblog) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect('/admin/blog_list');
                });
        }
    }
]

exports.blog_delete_get = function(req, res){

    async.parallel({
        blog: function(callback) {
            Blog.findById(req.params.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.blog==null) { // No results.
            res.redirect('/admin/blog_list');
        }
        // Successful, so render.
        res.render('blog_delete', { title: 'Delete Post', blog: results.blog} );
    });
}

exports.blog_delete_post = function(req, res){

    async.parallel({
        blog: function(callback) {
            console.log(req.body.blogid);
            Blog.findById(req.body.blogid).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        console.log(results.blog.length);
        if (results.blog.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('blog_delete', { title: 'Delete Post', blog: results.blog} );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Blog.findByIdAndRemove(req.body.blogid, function deleteAuthor(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/admin/blog_list')
            })
        }
    });
}