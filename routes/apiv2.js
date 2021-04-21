const express = require('express');
const router = express.Router();
const token = require('../utils/token');

/* 校验用户信息 */
router.get('/:uid/*', function(req, res, next) {
  const uid = req.params.uid;
  if (!uid || !/^\d+$/.test(uid) || !token.verify(req.query._tk, uid)) {
    return res.json({ code: 400 });
  }
  next();
});
router.get('/:uid/test', function(req, res, next) {
  res.json({ name: 'v2_test', uid: req.params.uid })
});

module.exports = router;
