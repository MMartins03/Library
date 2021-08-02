var dishInstance = require('../models/dishinstance')
var dish = require('../models/dish')
var async = require('async')

const { body,validationResult } = require("express-validator");

// Display list of all dishInstances.
exports.dishinstance_list = function(req, res, next) {

  dishInstance.find()
    .populate('dish')
    .exec(function (err, list_dishinstances) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('dishinstance_list', { title: 'dish Instance List', dishinstance_list:  list_dishinstances});
    })

};

// Display detail page for a specific dishInstance.
exports.dishinstance_detail = function(req, res, next) {

    dishInstance.findById(req.params.id)
    .populate('dish')
    .exec(function (err, dishinstance) {
      if (err) { return next(err); }
      if (dishinstance==null) { // No results.
          var err = new Error('dish copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('dishinstance_detail', { title: 'dish:', dishinstance:  dishinstance});
    })

};

// Display dishInstance create form on GET.
exports.dishinstance_create_get = function(req, res, next) {

     dish.find({},'title')
    .exec(function (err, dishs) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('dishinstance_form', {title: 'Create dishInstance', dish_list:dishs } );
    });

};

// Handle dishInstance create on POST.
exports.dishinstance_create_post = [

    // Validate and sanitize fields.
    body('dish', 'dish must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),
    
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a dishInstance object with escaped and trimmed data.
        var dishinstance = new dishInstance(
          { dish: req.body.dish,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            dish.find({},'title')
                .exec(function (err, dishs) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('dishinstance_form', { title: 'Create dishInstance', dish_list : dishs, selected_dish : dishinstance.dish._id , errors: errors.array(), dishinstance:dishinstance });
            });
            return;
        }
        else {
            // Data from form is valid
            dishinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(dishinstance.url);
                });
        }
    }
];



// Display dishInstance delete form on GET.
exports.dishinstance_delete_get = function(req, res, next) {

    dishInstance.findById(req.params.id)
    .populate('dish')
    .exec(function (err, dishinstance) {
        if (err) { return next(err); }
        if (dishinstance==null) { // No results.
            res.redirect('/catalog/dishinstances');
        }
        // Successful, so render.
        res.render('dishinstance_delete', { title: 'Delete dishInstance', dishinstance:  dishinstance});
    })

};

// Handle dishInstance delete on POST.
exports.dishinstance_delete_post = function(req, res, next) {
    
    // Assume valid dishInstance id in field.
    dishInstance.findByIdAndRemove(req.body.id, function deletedishInstance(err) {
        if (err) { return next(err); }
        // Success, so redirect to list of dishInstance items.
        res.redirect('/catalog/dishinstances');
        });

};

// Display dishInstance update form on GET.
exports.dishinstance_update_get = function(req, res, next) {

    // Get dish, chefs and genres for form.
    async.parallel({
        dishinstance: function(callback) {
            dishInstance.findById(req.params.id).populate('dish').exec(callback)
        },
        dishs: function(callback) {
            dish.find(callback)
        },

        }, function(err, results) {
            if (err) { return next(err); }
            if (results.dishinstance==null) { // No results.
                var err = new Error('dish copy not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('dishinstance_form', { title: 'Update  dishInstance', dish_list : results.dishs, selected_dish : results.dishinstance.dish._id, dishinstance:results.dishinstance });
        });

};

// Handle dishInstance update on POST.
exports.dishinstance_update_post = [

    // Validate and sanitize fields.
    body('dish', 'dish must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),
    
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a dishInstance object with escaped/trimmed data and current id.
        var dishinstance = new dishInstance(
          { dish: req.body.dish,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
           });

        if (!errors.isEmpty()) {
            // There are errors so render the form again, passing sanitized values and errors.
            dish.find({},'title')
                .exec(function (err, dishs) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('dishinstance_form', { title: 'Update dishInstance', dish_list : dishs, selected_dish : dishinstance.dish._id , errors: errors.array(), dishinstance:dishinstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            dishInstance.findByIdAndUpdate(req.params.id, dishinstance, {}, function (err,thedishinstance) {
                if (err) { return next(err); }
                   // Successful - redirect to detail page.
                   res.redirect(thedishinstance.url);
                });
        }
    }
];
