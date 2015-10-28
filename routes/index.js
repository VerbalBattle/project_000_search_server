var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  var partialSearchTerm = req.body.searchterm;

  console.log('yay');

  res.send('nice');
});

module.exports = router;
