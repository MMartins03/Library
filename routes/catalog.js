var express = require('express');
var router = express.Router();


// Require our controllers.
var dish_controller = require('../controllers/dishController'); 
var chef_controller = require('../controllers/chefController');
var genre_controller = require('../controllers/genreController');
var dish_instance_controller = require('../controllers/dishinstanceController');


/// dish ROUTES ///

// GET catalog home page.
router.get('/', dish_controller.index);  

// GET request for creating a dish. NOTE This must come before routes that display dish (uses id).
router.get('/dish/create', dish_controller.dish_create_get);

// POST request for creating dish.
router.post('/dish/create', dish_controller.dish_create_post);

// GET request to delete dish.
router.get('/dish/:id/delete', dish_controller.dish_delete_get);

// POST request to delete dish.
router.post('/dish/:id/delete', dish_controller.dish_delete_post);

// GET request to update dish.
router.get('/dish/:id/update', dish_controller.dish_update_get);

// POST request to update dish.
router.post('/dish/:id/update', dish_controller.dish_update_post);

// GET request for one dish.
router.get('/dish/:id', dish_controller.dish_detail);

// GET request for list of all dish.
router.get('/dishs', dish_controller.dish_list);

/// chef ROUTES ///

// GET request for creating chef. NOTE This must come before route for id (i.e. display chef).
router.get('/chef/create', chef_controller.chef_create_get);

// POST request for creating chef.
router.post('/chef/create', chef_controller.chef_create_post);

// GET request to delete chef.
router.get('/chef/:id/delete', chef_controller.chef_delete_get);

// POST request to delete chef
router.post('/chef/:id/delete', chef_controller.chef_delete_post);

// GET request to update chef.
router.get('/chef/:id/update', chef_controller.chef_update_get);

// POST request to update chef.
router.post('/chef/:id/update', chef_controller.chef_update_post);

// GET request for one chef.
router.get('/chef/:id', chef_controller.chef_detail);

// GET request for list of all chefs.
router.get('/chefs', chef_controller.chef_list);


/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get('/genre/create', genre_controller.genre_create_get);

// POST request for creating Genre.
router.post('/genre/create', genre_controller.genre_create_post);

// GET request to delete Genre.
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST request to delete Genre.
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// GET request to update Genre.
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST request to update Genre.
router.post('/genre/:id/update', genre_controller.genre_update_post);

// GET request for one Genre.
router.get('/genre/:id', genre_controller.genre_detail);

// GET request for list of all Genre.
router.get('/genres', genre_controller.genre_list);


/// dishINSTANCE ROUTES ///

// GET request for creating a dishInstance. NOTE This must come before route that displays dishInstance (uses id).
router.get('/dishinstance/create', dish_instance_controller.dishinstance_create_get);

// POST request for creating dishInstance.
router.post('/dishinstance/create', dish_instance_controller.dishinstance_create_post);

// GET request to delete dishInstance.
router.get('/dishinstance/:id/delete', dish_instance_controller.dishinstance_delete_get);

// POST request to delete dishInstance.
router.post('/dishinstance/:id/delete', dish_instance_controller.dishinstance_delete_post);

// GET request to update dishInstance.
router.get('/dishinstance/:id/update', dish_instance_controller.dishinstance_update_get);

// POST request to update dishInstance.
router.post('/dishinstance/:id/update', dish_instance_controller.dishinstance_update_post);

// GET request for one dishInstance.
router.get('/dishinstance/:id', dish_instance_controller.dishinstance_detail);

// GET request for list of all dishInstance.
router.get('/dishinstances', dish_instance_controller.dishinstance_list);


module.exports = router;
