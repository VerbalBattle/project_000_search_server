// update node: http://localhost:7474/db/data/node/390/properties

// import graph database and connect to it
// var neo4j = require('neo4j');
// var db = new neo4j.GraphDatabase('http://neo4j:E@}Xz5Y7>q5(~pKG@localhost:7474');
var request = require('request');
var txUrl = "http://localhost:7474";
var auth = {
  user: 'neo4j',
  pass: 'E@}Xz5Y7>q5(~pKG',
  sendImmediately: true
}

var User = require('../db/users');
var Promise = require('promise');

var prefixTree = {};

prefixTree.addToTree = function (user) {
  var username = user.username;
  var prefix = username;
  var lastNode;

  return new Promise(function(resolve, reject) {
    // doing recursively to ensure that nodes get created before we move
    // on with tree traversal
    var recurseInsert = function () {
      if(prefix === "") {
        console.log('------------------------');
        resolve("created");
        return;
      }

      User.find({username: prefix}, function (err, data) {
        if(err) {
          reject(err);
        }

        if(data.length > 0) {
          request.get({
            url: txUrl + '/db/data/node/' + data[0].nodeid,
            auth: auth
          }, function (err, response) {
            if(err) {
              reject(err);
            }

            var body = JSON.parse(response.body);

            if (response.body.exception !== undefined || body.data.text !== username) {
              var nodeId = body.metadata.id;

              request.post(txUrl + 'db/data/node/' + nodeId + '/relationships', {
                  auth: auth,
                  to : txUrl + '/db/data/node/' + lastNode.metadata.id,
                  type : 'KNOWS'
                }, function (err, httpResponse, body) {
                  if(err) {
                    reject(err);
                  } else {
                    resolve("created");
                  }
              });
            }
          });
        } else {
          // create node in db connected to lastly created node
          request.post(txUrl + '/db/data/node', {
            auth: auth,
            form: {
              userid: user.id,
              text: prefix,
              isUsername: false
            }
          }, function (err, httpResponse, body) {
            var body = JSON.parse(httpResponse.body);
            var nodeid = body.metadata.id;

            request.post(txUrl + '/db/data/node/' + nodeid + '/relationships', {
                auth: auth,
                form: {
                  to : txUrl + '/db/data/node/' + lastNode.metadata.id,
                  type : 'KNOWS'
                }
              }, function (err, response) {
                if(err) {
                  reject(err);
                } else {
                  prefix = prefix.slice(0, prefix.length - 1);
                  lastNode = body;

                  recurseInsert();
                }
            });
          });
        }
      });
    }

    User.find({username: username}, function(err, data) {
      if(err) {
        reject(err);
      }

      // check to see if we have found a node in the database with the username
      // provided no need to create anything
      if(data.length === 0) {
        request.post(txUrl + '/db/data/node/', {
            auth: auth,
            form: {
              userid: user.id,
              text: prefix,
              isUsername: true
            }
          }, function (err, httpResponse, body) {
            if(err) {
              reject(err);
            } else {
              var response = JSON.parse(httpResponse.body);

              var newUser = new User();
              newUser.nodeid = response.metadata.id;
              newUser.username = response.data.text;

              newUser.save(function (err) {
                if(err) {
                  reject(err);
                } else {
                  prefix = prefix.slice(0, prefix.length - 1);
                  lastNode = response;
                  recurseInsert();
                }
              });
            }
        });
      } else {
        // update node to turn isUsername property true
        request.put(txUrl + '/db/data/node/' + data[0].nodeid + '/properties', {
          auth: auth,
          form: {isUsername : true}
        }, function () {
          resolve("exists");
        });
      }
    });

    // http://localhost:7474/db/data/node
    // request.post(txUrl + '/db/data/node/', {
    //     auth: auth,
    //     form: {
    //       userid: user.id,
    //       text: prefix,
    //       isUsername: true
    //     }
    //   }, function (err, httpResponse, body) {
    //     if(err) {
    //       reject(err);
    //     } else {
    //       var response = JSON.parse(httpResponse.body);

    //       var newUser = new User();
    //       newUser.nodeid = response.metadata.id;
    //       newUser.username = response.data.text;

    //       newUser.save(function (err) {
    //         if(err) {
    //           reject(err);
    //         } else {
    //           resolve();
    //         }
    //       });
    //     }
    // });
  });
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