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
      if (prefix === "") {
        resolve("created");
        return;
      }

      User.find({text: prefix}, function (err, data) {
        if(err) {
          reject(err);
        }

        if (data.length > 0) {
          request.get({
            url: txUrl + '/db/data/node/' + data[0].nodeid,
            auth: auth
          }, function (err, response) {
            if (err) {
              reject(err);
            }

            var body = JSON.parse(response.body);

            if (response.body.exception !== undefined || body.data.text !== username) {
              var nodeId = body.metadata.id;

              request.post(txUrl + '/db/data/node/' + nodeId.toString() + '/relationships', {
                  auth: auth,
                  form: {
                    to : txUrl + '/db/data/node/' + lastNode.metadata.id.toString(),
                    type : 'KNOWS'
                  }
                }, function (err, httpResponse, body) {
                  // var response = JSON.parse(httpResponse);
                  if (err) {
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
              userid: user.userid,
              text: prefix,
              isUsername: false
            }
          }, function (err, httpResponse, body) {
            var response = JSON.parse(httpResponse.body);
            var nodeid = response.metadata.id;

            var newUser = new User();
            newUser.nodeid = response.metadata.id;
            newUser.text = response.data.text;
            newUser.isUser = response.data.isUsername

            newUser.save(function (err) {
              if (err) {
                reject(err);
              } else {
                if(lastNode.metadata) {
                  request.post(txUrl + '/db/data/node/' + nodeid + '/relationships', {
                      auth: auth,
                      form: {
                        to : txUrl + '/db/data/node/' + lastNode.metadata.id,
                        type : 'KNOWS'
                      }
                    }, function (err, res) {
                      if (err) {
                        reject(err);
                      } else {
                        prefix = prefix.slice(0, prefix.length - 1);
                        lastNode = response;

                        recurseInsert();
                      }
                  });
                } else {
                  prefix = prefix.slice(0, prefix.length - 1);
                  lastNode = response;

                  recurseInsert();
                }
              }
            });
          });
        }
      });
    }

    User.find({text: username}, function(err, data) {
      if (err) {
        reject(err);
      }

      // check to see if we have found a node in the database with the username
      // provided no need to create anything
      if(data.length === 0) {
        request.post(txUrl + '/db/data/node/', {
            auth: auth,
            form: {
              userid: user.userid,
              text: prefix,
              isUsername: true
            }
          }, function (err, httpResponse, body) {
            if (err) {
              reject(err);
            } else {
              var response = JSON.parse(httpResponse.body);

              var newUser = new User();
              newUser.nodeid = response.metadata.id;
              newUser.userid = user.userid;
              newUser.text = response.data.text;
              newUser.isUser = true;

              newUser.save(function (err) {
                if (err) {
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
          User.update({text: username}, {isUser: true, userid: user.userid}, {}, function(err, data) {
            resolve("exists");
          });
        });
      }
    });
  });
};

prefixTree.getSuggestions = function (searchText, shortSearch) {
  // sample url to get relationships of a node
  // http://localhost:7474/db/data/node/10093/relationships/out/{-list|&|types}
  var prefixURL = "http://localhost:7474/db/data/node/";
  var suffixURL = "/relationships/out";

  return new Promise(function (resolve, reject) {
    var answer = [];

    var recurseGetSuggestions = function (nodeID) {
      return new Promise(function (resolveInner, rejectInner) {
        request.get({auth: auth, url: prefixURL + nodeID.toString() + suffixURL},
        function (err, httpResponse, body) {
          if (err) {
            rejectInner(err);
          }

          var response = JSON.parse(httpResponse.body);

          if (response.length === 0) {
            resolveInner(answer);
          } else {
            var subQueriesReceived = 0;

            response.forEach(function (obj) {
              var arr = obj.end.split('/');
              var connectionID = arr[arr.length - 1];

              User.find({nodeid: connectionID}, function (err, data) {
                var node = data[0];

                if (node.isUser) {
                  answer.push({text: node.text, userID: node.userid});
                }

                // if we have found five users to search,
                // preemptively stop traversal return findings
                if (shortSearch && answer.length >= 5) {
                  resolveInner(answer);
                } else {
                  recurseGetSuggestions(node.nodeid)
                  .then(function () {
                    subQueriesReceived++;

                    if (subQueriesReceived === response.length) {
                      resolveInner(answer);
                    }
                  })
                }
              });
            });
          }
        });
      });
    }

    User.find({text: searchText}, function (err, data) {
      if (err) {
        reject(err);
      }

      if (data.length === 0) {
        resolve(answer);
        return;
      } else {
        var node = data[0];

        if (node.isUser) {
          answer.push({text: node.text, userID: node.userid});
        }

        recurseGetSuggestions(node.nodeid)
        .then(function () {
          // resolve the parent promise
          resolve(answer);
        });
      }
    });
  });
}

module.exports = prefixTree;