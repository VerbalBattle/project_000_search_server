// import graph database and connect to it
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://username:password@localhost:7474');
var Promise = require('promise');

var prefixTree = {};

prefixTree.addToTree = function (user) {
  var username = user.username;
  var prefix = username;
  var lastNode;

  // doing recursively to ensure that nodes get created before we move
  // on with tree traversal
  var recurseInsert = function () {
    db.getIndexedNode('node_auto_index', 'text', prefix, function (node) {
      // we have found a node in the database with the username provided
      // no need to create anything
      if (prefix === username) {
        return;
      }

      if (node) {
        node.createRelationshipTo(lastNode, 'KNOWS');
        return;
      } else {
        var isUsername = false;

        if (prefix === username) {
          isUsername = true;
        }

        // create node in db connected to lastly created node
        var newNode = db.createNode({userid: user.id, text: prefix, isUsername: isUsername});
        newNode.save(function () {
          newNode.createRelationshipTo(lastNode, 'KNOWS', {}, function () {
            recurseInsert();
          });
        });
      }

      prefix = prefix.slice(0, prefix.length - 1);
      lastNode = node;
    });
  }

  recurseInsert();
};

prefixTree.getSuggestions = function (searchText) {

  return new Promise(function (resolve, reject) {
    db.getIndexedNode('node_auto_index', 'text', searchText, function (node) {
      if (node) {
        // loop through each relationship and resolve promise when all are done
        var answer = [];

        if (node.isUsername) {
          answer.push({id: node.userid, username: node.text});
        }

        node.getRelationships("KNOWS", function(relationships) {
          if (relationships) {
            var needCompletion = relationships.length;

            // find way to track progress of each asynchronous call
            relationships.forEach(function(connection) {
              getSuggestions(connection.text).then(function(data) {
                needCompletion--;
                answer = answer.concat(data);

                if (needCompletion === 0) {
                  resolve(answer);
                }
              });
            });
          } else {
            resolve(answer);
          }
        });
      } else {
        reject();
      }
    });
  });
}

module.exports = prefixTree;