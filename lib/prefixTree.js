// import graph database and connect to it
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://username:password@localhost:7474');

var prefixTree = {};

prefixTree.addToTree = function (username) {
  var charArray = username.split('');
  var prefix = username;
  var connected = false;

  while(!connected) {
    db.getIndexedNode('node_auto_index', 'username', prefix, function (node) {
      prefix = prefix.slice(0, prefix.length - 1);

      if(node) {
        connected = true;
      } else {
        // create node in db connected to lastly created node
      }
    });
  }
};

module.exports = prefixTree;