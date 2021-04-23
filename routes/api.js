const express = require('express');
const router = express.Router();
const mysql = require('../utils/mysql');

/* 公共api */
router.get('/test', async (req, res, next) => {
  let ping = 0;
  let msg = '';
  try {
    const conn = await mysql.connect();
    await mysql.ping(conn);
    mysql.release(conn);
    ping = 1;
  } catch (e) {
    if (e.message) msg = e.message;
  }

  res.json({ code: 0, name: 'test', ping, msg });
});

module.exports = router;
