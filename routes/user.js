var express = require('express');
var router = express.Router();
var graphDB = require('../lib/graphDatabase');

/* POST /newuser */
router.post('/:username', function (req, res, next) {
  var username = req.params.username;

  graphDB.addUser(username, function (error) {
    if (error) {
      res.send(500);
    } else {
      res.send(201);
    }
  });
});

router.delete('/:username', function (req, res, next) {
  var username = req.params.username;

  graphDB.deleteUser(username, function (error) {
    if (error) {
      res.send(500);
    } else {
      res.send(204);
    }
  });
});

module.exports = router;
