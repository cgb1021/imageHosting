const express = require('express');
const router = express.Router();

/* 公共api */
router.get('/test', function(req, res, next) {
  res.json({ name: 'test' })
});

module.exports = router;
