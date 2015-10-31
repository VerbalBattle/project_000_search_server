
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Users = new Schema({
    nodeid: Number,
    username: String
});

var usersTable = mongoose.model('Users', Users);

module.exports = usersTable;
