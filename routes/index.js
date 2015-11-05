var express = require('express');
var router = express.Router();
var graphDB = require('../lib/graphDatabase');

/* POST index page. */
router.post('/', function (req, res, next) {
  var params = req.body;
  var partialSearchTerm = params.searchterm;
  var shortSearch = params.shortsearch;

  if (partialSearchTerm === 'newuser' || partialSearchTerm === 'users') {
    res.send('quit trolling us please');
  } else {
    graphDB.getSuggestions(partialSearchTerm, shortSearch, function (error, suggestions) {
      if(error) {
        res.send(error);
      } else {
        res.send(suggestions);
      }
    });
  }
});

module.exports = router;
