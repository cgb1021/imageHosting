var express = require('express');
var router = express.Router();
var index = require('../controllers/index')

/* GET home page. */
router.get('/', function(req, res, next) {
  index.main(req, res)
});

module.exports = router;
