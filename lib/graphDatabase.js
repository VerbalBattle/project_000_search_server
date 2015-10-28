// import graph database and connect to it
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://username:password@localhost:7474');

var graphDB = {}

graphDB.addUser = function (username, callback) {
  callback(undefined, username);
};

graphDB.getSuggestions = function (partialSearchTerm, callback) {
  callback(undefined, partialSearchTerm);
};

module.exports = graphDB;