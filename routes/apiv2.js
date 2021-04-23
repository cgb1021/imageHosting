const express = require('express');
const router = express.Router();
const user = require('../models/user');

/* 校验用户信息 */
router.get('/:uid/*', (req, res, next) => {
  const fn403 = () => {
    res.status(403);
    res.json({ code: 403 });
  }
  const uid = +req.params.uid;
  const token = req.cookies.u_tk || req.headers['x-access-token'];
  const name = req.cookies.u_name || req.headers['x-access-name'];
  if (!uid || !/^\d+$/.test(uid) || !token) {
    return fn403();
  }
  req.user = { id: 0 };
  user.verifyToken(token, {
    id: uid,
    name
  }, req.user);
  if (uid !== req.user.id) {
    return fn403();
  }
  Object.defineProperty(req, 'user', {
    writable: false
  })
  next();
});
router.get('/:uid/test', (req, res, next) => {
  res.json({ code: 0, name: 'v2_test', user: req.user })
});

module.exports = router;
