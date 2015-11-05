
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Users = new Schema({
    nodeid: Number,
    userid: Number,
    text: String,
    isUser: Boolean
});

var usersTable = mongoose.model('Users', Users);

module.exports = usersTable;
