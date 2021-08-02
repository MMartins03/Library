var chef = require('../models/chef')
var async = require('async')
var dish = require('../models/dish')

const { body,validationResult } = require("express-validator");

// Display list of all chefs.
exports.chef_list = function (req, res, next) {

    chef.find()
        .sort([['chef_name', 'ascending']])
        .exec(function (err, list_chefs) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('chef_list', { title: 'chef List', chef_list: list_chefs });
        })

};

// Display detail page for a specific chef.
exports.chef_detail = function (req, res, next) {

    async.parallel({
        chef: function (callback) {
            chef.findById(req.params.id)
                .exec(callback)
        },
        chefs_dishs: function (callback) {
            dish.find({ 'chef': req.params.id }, 'title summary')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.chef == null) { // No results.
            var err = new Error('chef not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('chef_detail', { title: 'chef Detail', chef: results.chef, chef_dishs: results.chefs_dishs });
    });

};

// Display chef create form on GET.
exports.chef_create_get = function (req, res, next) {
    res.render('chef_form', { title: 'Create chef' });
};

// Handle chef create on POST.
exports.chef_create_post = [

    // Validate and sanitize fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('chef_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        // Create chef object with escaped and trimmed data
        var chef = new chef(
            {
                first_name: req.body.first_name,
                chef_name: req.body.chef_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('chef_form', { title: 'Create chef', chef: chef, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Save chef.
            chef.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new chef record.
                res.redirect(chef.url);
            });
        }
    }
];



// Display chef delete form on GET.
exports.chef_delete_get = function (req, res, next) {

    async.parallel({
        chef: function (callback) {
            chef.findById(req.params.id).exec(callback)
        },
        chefs_dishs: function (callback) {
            dish.find({ 'chef': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.chef == null) { // No results.
            res.redirect('/catalog/chefs');
        }
        // Successful, so render.
        res.render('chef_delete', { title: 'Delete chef', chef: results.chef, chef_dishs: results.chefs_dishs });
    });

};

// Handle chef delete on POST.
exports.chef_delete_post = function (req, res, next) {

    async.parallel({
        chef: function (callback) {
            chef.findById(req.body.chefid).exec(callback)
        },
        chefs_dishs: function (callback) {
            dish.find({ 'chef': req.body.chefid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        if (results.chefs_dishs.length > 0) {
            // chef has dishs. Render in same way as for GET route.
            res.render('chef_delete', { title: 'Delete chef', chef: results.chef, chef_dishs: results.chefs_dishs });
            return;
        }
        else {
            // chef has no dishs. Delete object and redirect to the list of chefs.
            chef.findByIdAndRemove(req.body.chefid, function deletechef(err) {
                if (err) { return next(err); }
                // Success - go to chef list.
                res.redirect('/catalog/chefs')
            })

        }
    });

};

// Display chef update form on GET.
exports.chef_update_get = function (req, res, next) {

    chef.findById(req.params.id, function (err, chef) {
        if (err) { return next(err); }
        if (chef == null) { // No results.
            var err = new Error('chef not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('chef_form', { title: 'Update chef', chef: chef });

    });
};

// Handle chef update on POST.
exports.chef_update_post = [

    // Validate and santize fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('chef_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),


    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create chef object with escaped and trimmed data (and the old id!)
        var chef = new chef(
            {
                first_name: req.body.first_name,
                chef_name: req.body.chef_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('chef_form', { title: 'Update chef', chef: chef, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            chef.findByIdAndUpdate(req.params.id, chef, {}, function (err, thechef) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(thechef.url);
            });
        }
    }
];
