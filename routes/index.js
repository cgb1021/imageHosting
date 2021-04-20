var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.locals.serverData = {
    hello: 'world'
  }
  res.render('index', { title: 'Express', serverData: {
    hello2: 'world2'
  } });
});

module.exports = router;
