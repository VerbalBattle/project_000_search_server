var express = require('express');
var router = express.Router();
var graphDB = require('../lib/graphDatabase');

/* POST /newuser */
router.post('/:username', function (req, res, next) {
  var user = req.body.user;

  graphDB.addUser(user, function (error, status) {
    if (error) {
      res.sendStatus(500);
    } else {
      if(status === "exists") {
        res.sendStatus(200);
      } else if(status === "created") {
        res.sendStatus(201);
      }
    }
  });
});

router.delete('/:username', function (req, res, next) {
  var username = req.params.username;

  graphDB.deleteUser(username, function (error) {
    if (error) {
      res.sendStatus(500);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = router;
