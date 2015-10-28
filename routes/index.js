var express = require('express');
var router = express.Router();
var graphDB = require('../lib/graphDatabase');

/* POST index page. */
router.post('/:searchterm', function (req, res, next) {
  var partialSearchTerm = req.params.searchterm;

  if (partialSearchTerm === 'newuser') {
    res.send('quit trolling us please');
  } else {
    graphDB.getSuggestions(partialSearchTerm, function (error, suggestions) {
      if(error) {
        res.send(error);
      } else {
        res.send(suggestions);
      }
    });
  }
});

module.exports = router;
