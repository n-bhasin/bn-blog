var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    comment: {type: String, required: true},
    posts: {type: Schema.Types.ObjectId, require: true, index:true}
})


userSchema
.virtual('url')
.get(function(){
    return 'comment/' + this.posts;
});

module.exports = mongoose.model('User', userSchema);