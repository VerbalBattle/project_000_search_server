var prefixTree = require('./prefixTree');

var graphDB = {};

graphDB.addUser = function (username, callback) {
  callback(undefined);
};

graphDB.deleteUser = function (username, callback) {
  callback(undefined);
};

graphDB.getSuggestions = function (partialSearchTerm, callback) {
  callback(undefined, partialSearchTerm);
};

module.exports = graphDB;