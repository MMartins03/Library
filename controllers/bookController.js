var dish = require('../models/dish');
var chef = require('../models/chef');
var Genre = require('../models/genre');
var dishInstance = require('../models/dishinstance');

const { body,validationResult } = require("express-validator");

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        dish_count: function(callback) {
            dish.countDocuments({},callback);
        },
        dish_instance_count: function(callback) {
            dishInstance.countDocuments({},callback);
        },
        dish_instance_available_count: function(callback) {
            dishInstance.countDocuments({status:'Available'},callback);
        },
        chef_count: function(callback) {
            chef.countDocuments({},callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({},callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};


// Display list of all dishs.
exports.dish_list = function(req, res, next) {

  dish.find({}, 'title chef')
    .populate('chef').exec(function (err, list_dishs) {
      if (err) {return next(err)} 
      else {
            // Successful, so render
            res.render('dish_list', { title: 'dish List', dish_list:  list_dishs});
        }
    });

};

// Display detail page for a specific dish.
exports.dish_detail = function(req, res, next) {

    async.parallel({
        dish: function(callback) {

            dish.findById(req.params.id)
              .populate('chef')
              .populate('genre')
              .exec(callback);
        },
        dish_instance: function(callback) {

          dishInstance.find({ 'dish': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.dish==null) { // No results.
            var err = new Error('dish not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('dish_detail', { title: results.dish.title, dish:  results.dish, dish_instances: results.dish_instance } );
    });

};

// Display dish create form on GET.
exports.dish_create_get = function(req, res, next) {

    // Get all chefs and genres, which we can use for adding to our dish.
    async.parallel({
        chefs: function(callback) {
            chef.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('dish_form', { title: 'Create dish',chefs:results.chefs, genres:results.genres });
    });

};

// Handle dish create on POST.
exports.dish_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate and sanitize fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('chef', 'chef must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a dish object with escaped and trimmed data.
        var dish = new dish(
          { title: req.body.title,
            chef: req.body.chef,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all chefs and genres for form.
            async.parallel({
                chefs: function(callback) {
                    chef.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (dish.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('dish_form', { title: 'Create dish',chefs:results.chefs, genres:results.genres, dish: dish, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save dish.
            dish.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new dish record.
                   res.redirect(dish.url);
                });
        }
    }
];



// Display dish delete form on GET.
exports.dish_delete_get = function(req, res, next) {

    async.parallel({
        dish: function(callback) {
            dish.findById(req.params.id).populate('chef').populate('genre').exec(callback);
        },
        dish_dishinstances: function(callback) {
            dishInstance.find({ 'dish': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.dish==null) { // No results.
            res.redirect('/catalog/dishs');
        }
        // Successful, so render.
        res.render('dish_delete', { title: 'Delete dish', dish: results.dish, dish_instances: results.dish_dishinstances } );
    });

};

// Handle dish delete on POST.
exports.dish_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        dish: function(callback) {
            dish.findById(req.body.id).populate('chef').populate('genre').exec(callback);
        },
        dish_dishinstances: function(callback) {
            dishInstance.find({ 'dish': req.body.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.dish_dishinstances.length > 0) {
            // dish has dish_instances. Render in same way as for GET route.
            res.render('dish_delete', { title: 'Delete dish', dish: results.dish, dish_instances: results.dish_dishinstances } );
            return;
        }
        else {
            // dish has no dishInstance objects. Delete object and redirect to the list of dishs.
            dish.findByIdAndRemove(req.body.id, function deletedish(err) {
                if (err) { return next(err); }
                // Success - got to dishs list.
                res.redirect('/catalog/dishs');
            });

        }
    });

};

// Display dish update form on GET.
exports.dish_update_get = function(req, res, next) {

    // Get dish, chefs and genres for form.
    async.parallel({
        dish: function(callback) {
            dish.findById(req.params.id).populate('chef').populate('genre').exec(callback);
        },
        chefs: function(callback) {
            chef.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.dish==null) { // No results.
                var err = new Error('dish not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var dish_g_iter = 0; dish_g_iter < results.dish.genre.length; dish_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()===results.dish.genre[dish_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            res.render('dish_form', { title: 'Update dish', chefs:results.chefs, genres:results.genres, dish: results.dish });
        });

};


// Handle dish update on POST.
exports.dish_update_post = [

    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },
   
    // Validate and santitize fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('chef', 'chef must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a dish object with escaped/trimmed data and old id.
        var dish = new dish(
          { title: req.body.title,
            chef: req.body.chef,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all chefs and genres for form
            async.parallel({
                chefs: function(callback) {
                    chef.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (dish.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('dish_form', { title: 'Update dish',chefs:results.chefs, genres:results.genres, dish: dish, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            dish.findByIdAndUpdate(req.params.id, dish, {}, function (err,thedish) {
                if (err) { return next(err); }
                   // Successful - redirect to dish detail page.
                   res.redirect(thedish.url);
                });
        }
    }
];

