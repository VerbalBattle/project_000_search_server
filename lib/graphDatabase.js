var prefixTree = require('./prefixTree');

var graphDB = {};

graphDB.addUser = function (user, callback) {
  prefixTree.addToTree(user)
  .then(function (status) {
    callback(undefined, status);
  })
  .catch(function (error) {
    callback(error);
  })
};

graphDB.deleteUser = function (username, callback) {
  callback(undefined);
};

graphDB.getSuggestions = function (partialSearchTerm, shortSearch, callback) {
  prefixTree.getSuggestions(partialSearchTerm, shortSearch)
  .then(function (suggestions) {
    callback(undefined, suggestions);
  })
  .catch(function (error) {
    callback(error);
  })
};

module.exports = graphDB;