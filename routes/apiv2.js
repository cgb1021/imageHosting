const express = require('express');
const router = express.Router();
const user = require('../models/user');

/* 校验用户信息 */
router.get('/:uid/*', function(req, res, next) {
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
  res.locals.user = { id: 0 };
  user.verifyToken({
    id: uid,
    name
  }, token, res.locals.user);
  if (uid !== res.locals.user.id) {
    return fn403();
  }
  next();
});
router.get('/:uid/test', function(req, res, next) {
  res.json({ code: 0, name: 'v2_test', user: res.locals.user })
});

module.exports = router;
