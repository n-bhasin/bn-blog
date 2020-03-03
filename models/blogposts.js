var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var blogpostSchema = new Schema(
    {
        title: {type: String, required: true},
        author: {type: Schema.Types.ObjectId, ref: 'Admin', required: true}, //reference to associated admini
        //preview: {type: String, required: true, maxlength: 200},
        description: {type: String, required: true},
        written_date: {type: Date, default: Date.now}
        
    }
);


//virtual book's url
blogpostSchema
.virtual('url')
.get(function(){
    return '/admin/blog/' + this._id;
});

blogpostSchema
.virtual('written_date_formatted')
.get(function () {
  return moment(this.written_date).format('MMMM Do, YYYY');
});

module.exports = mongoose.model('BlogPost', blogpostSchema);