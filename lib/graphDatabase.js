var prefixTree = require('./prefixTree');

var graphDB = {};

graphDB.addUser = function (username, callback) {
  prefixTree.addToTree({username: username, userid: 1})
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

graphDB.getSuggestions = function (partialSearchTerm, callback) {
  prefixTree.getSuggestions(partialSearchTerm)
  .then(function (suggestions) {
    callback(undefined, suggestions);
  })
  .catch(function (error) {
    callback(error);
  })
};

module.exports = graphDB;