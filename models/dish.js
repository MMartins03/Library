var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var dishSchema = new Schema({
    title: {type: String, required: true},
    chef: { type: Schema.ObjectId, ref: 'chef', required: true },
    summary: {type: String, required: true},
    isbn: {type: String, required: true},
    genre: [{ type: Schema.ObjectId, ref: 'Genre' }]
});

// Virtual for this dish instance URL.
dishSchema
.virtual('url')
.get(function () {
  return '/catalog/dish/'+this._id;
});

// Export model.
module.exports = mongoose.model('dish', dishSchema);
