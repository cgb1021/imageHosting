const express = require('express');
const router = express.Router();
const token = require('../utils/token');

/* GET home page. */
router.get('/test', function(req, res, next) {
  res.json({ name: 'test', pass: token.verify(req.query.token) })
});

module.exports = router;
