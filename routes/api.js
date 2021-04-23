const express = require('express');
const router = express.Router();

/* 公共api */
router.get('/test', (req, res, next) => {
  res.json({ code: 0, name: 'test' });
});

module.exports = router;
