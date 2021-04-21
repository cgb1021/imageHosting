const express = require('express');
const router = express.Router();
const token = require('../utils/token');

/* 校验token */
router.get('*', function(req, res, next) {
  if (!token.verify(req.query._tk)) {
    return res.json({ code: 400 });
  }
  next();
});
router.get('/test', function(req, res, next) {
  res.json({ name: 'v1_test' })
});

module.exports = router;
