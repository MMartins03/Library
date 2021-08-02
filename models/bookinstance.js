var mongoose = require('mongoose');
const { DateTime } = require("luxon");  //for date handling

var Schema = mongoose.Schema;

var dishInstanceSchema = new Schema({
    dish: { type: Schema.ObjectId, ref: 'dish', required: true }, // Reference to the associated dish.
    imprint: {type: String, required: true},
    status: {type: String, required: true, enum:['Available', 'Maintenance', 'Loaned', 'Reserved'], default:'Maintenance'},
    due_back: { type: Date, default: Date.now },
});

// Virtual for this dishinstance object's URL.
dishInstanceSchema
.virtual('url')
.get(function () {
  return '/catalog/dishinstance/'+this._id;
});


dishInstanceSchema
.virtual('due_back_formatted')
.get(function () {
  return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

dishInstanceSchema
.virtual('due_back_yyyy_mm_dd')
.get(function () {
  return DateTime.fromJSDate(this.due_back).toISODate(); //format 'YYYY-MM-DD'
});


// Export model.
module.exports = mongoose.model('dishInstance', dishInstanceSchema);
