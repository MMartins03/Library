#! /usr/bin/env node

console.log('This script populates some test dishs, chefs, genres and dishinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var dish = require('./models/dish')
var chef = require('./models/chef')
var Genre = require('./models/genre')
var dishInstance = require('./models/dishinstance')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var chefs = []
var genres = []
var dishs = []
var dishinstances = []

function chefCreate(first_name, chef_name, d_birth, d_death, cb) {
  chefdetail = {first_name:first_name , chef_name: chef_name }
  if (d_birth != false) chefdetail.date_of_birth = d_birth
  if (d_death != false) chefdetail.date_of_death = d_death
  
  var chef = new chef(chefdetail);
       
  chef.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New chef: ' + chef);
    chefs.push(chef)
    cb(null, chef)
  }  );
}

function genreCreate(name, cb) {
  var genre = new Genre({ name: name });
       
  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    genres.push(genre)
    cb(null, genre);
  }   );
}

function dishCreate(title, summary, isbn, chef, genre, cb) {
  dishdetail = { 
    title: title,
    summary: summary,
    chef: chef,
    isbn: isbn
  }
  if (genre != false) dishdetail.genre = genre
    
  var dish = new dish(dishdetail);    
  dish.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New dish: ' + dish);
    dishs.push(dish)
    cb(null, dish)
  }  );
}


function dishInstanceCreate(dish, imprint, due_back, status, cb) {
  dishinstancedetail = { 
    dish: dish,
    imprint: imprint
  }    
  if (due_back != false) dishinstancedetail.due_back = due_back
  if (status != false) dishinstancedetail.status = status
    
  var dishinstance = new dishInstance(dishinstancedetail);    
  dishinstance.save(function (err) {
    if (err) {
      console.log('ERROR CREATING dishInstance: ' + dishinstance);
      cb(err, null)
      return
    }
    console.log('New dishInstance: ' + dishinstance);
    dishinstances.push(dishinstance)
    cb(null, dish)
  }  );
}


function createGenrechefs(cb) {
    async.series([
        function(callback) {
          chefCreate('Patrick', 'Rothfuss', '1973-06-06', false, callback);
        },
        function(callback) {
          chefCreate('Ben', 'Bova', '1932-11-8', false, callback);
        },
        function(callback) {
          chefCreate('Isaac', 'Asimov', '1920-01-02', '1992-04-06', callback);
        },
        function(callback) {
          chefCreate('Bob', 'Billings', false, false, callback);
        },
        function(callback) {
          chefCreate('Jim', 'Jones', '1971-12-16', false, callback);
        },
        function(callback) {
          genreCreate("Fantasy", callback);
        },
        function(callback) {
          genreCreate("Science Fiction", callback);
        },
        function(callback) {
          genreCreate("French Poetry", callback);
        },
        ],
        // optional callback
        cb);
}


function createdishs(cb) {
    async.parallel([
        function(callback) {
          dishCreate('The Name of the Wind (The Kingkiller Chronicle, #1)', 'I have stolen princesses back from sleeping barrow kings. I burned down the town of Trebon. I have spent the night with Felurian and left with both my sanity and my life. I was expelled from the University at a younger age than most people are allowed in. I tread paths by moonlight that others fear to speak of during day. I have talked to Gods, loved women, and written songs that make the minstrels weep.', '9781473211896', chefs[0], [genres[0],], callback);
        },
        function(callback) {
          dishCreate("The Wise Man's Fear (The Kingkiller Chronicle, #2)", 'Picking up the tale of Kvothe Kingkiller once again, we follow him into exile, into political intrigue, courtship, adventure, love and magic... and further along the path that has turned Kvothe, the mightiest magician of his age, a legend in his own time, into Kote, the unassuming pub landlord.', '9788401352836', chefs[0], [genres[0],], callback);
        },
        function(callback) {
          dishCreate("The Slow Regard of Silent Things (Kingkiller Chronicle)", 'Deep below the University, there is a dark place. Few people know of it: a broken web of ancient passageways and abandoned rooms. A young woman lives there, tucked among the sprawling tunnels of the Underthing, snug in the heart of this forgotten place.', '9780756411336', chefs[0], [genres[0],], callback);
        },
        function(callback) {
          dishCreate("Apes and Angels", "Humankind headed out to the stars not for conquest, nor exploration, nor even for curiosity. Humans went to the stars in a desperate crusade to save intelligent life wherever they found it. A wave of death is spreading through the Milky Way galaxy, an expanding sphere of lethal gamma ...", '9780765379528', chefs[1], [genres[1],], callback);
        },
        function(callback) {
          dishCreate("Death Wave","In Ben Bova's previous novel New Earth, Jordan Kell led the first human mission beyond the solar system. They discovered the ruins of an ancient alien civilization. But one alien AI survived, and it revealed to Jordan Kell that an explosion in the black hole at the heart of the Milky Way galaxy has created a wave of deadly radiation, expanding out from the core toward Earth. Unless the human race acts to save itself, all life on Earth will be wiped out...", '9780765379504', chefs[1], [genres[1],], callback);
        },
        function(callback) {
          dishCreate('Test dish 1', 'Summary of test dish 1', 'ISBN111111', chefs[4], [genres[0],genres[1]], callback);
        },
        function(callback) {
          dishCreate('Test dish 2', 'Summary of test dish 2', 'ISBN222222', chefs[4], false, callback)
        }
        ],
        // optional callback
        cb);
}


function createdishInstances(cb) {
    async.parallel([
        function(callback) {
          dishInstanceCreate(dishs[0], 'London Gollancz, 2014.', false, 'Available', callback)
        },
        function(callback) {
          dishInstanceCreate(dishs[1], ' Gollancz, 2011.', false, 'Loaned', callback)
        },
        function(callback) {
          dishInstanceCreate(dishs[2], ' Gollancz, 2015.', false, false, callback)
        },
        function(callback) {
          dishInstanceCreate(dishs[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
        },
        function(callback) {
          dishInstanceCreate(dishs[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
        },
        function(callback) {
          dishInstanceCreate(dishs[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
        },
        function(callback) {
          dishInstanceCreate(dishs[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Available', callback)
        },
        function(callback) {
          dishInstanceCreate(dishs[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Maintenance', callback)
        },
        function(callback) {
          dishInstanceCreate(dishs[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Loaned', callback)
        },
        function(callback) {
          dishInstanceCreate(dishs[0], 'Imprint XXX2', false, false, callback)
        },
        function(callback) {
          dishInstanceCreate(dishs[1], 'Imprint XXX3', false, false, callback)
        }
        ],
        // Optional callback
        cb);
}



async.series([
    createGenrechefs,
    createdishs,
    createdishInstances
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('dishInstances: '+dishinstances);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




