const express = require('express');
const router = express.Router();
const token = require('../utils/token');

/* 校验token */
router.get('*', function(req, res, next) {
  if (!token.verify(req.query._tk)) {
    res.status(403);
    return res.json({ code: 403 });
  }
  next();
});
router.get('/test', function(req, res, next) {
  res.json({ code: 0, name: 'v1_test' })
});

module.exports = router;
