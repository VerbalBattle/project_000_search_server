var prefixTree = require('./prefixTree');

var graphDB = {};

graphDB.addUser = function (username, callback) {
  prefixTree.addToTree({username: username, userid: 1})
  .then(function(status) {
    callback(undefined, status);
  })
  .catch(function(error) {
    callback(error);
  })
};

graphDB.deleteUser = function (username, callback) {
  callback(undefined);
};

graphDB.getSuggestions = function (partialSearchTerm, callback) {
  callback(undefined, partialSearchTerm);
};

module.exports = graphDB;