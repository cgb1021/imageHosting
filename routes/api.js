const express = require('express');
const router = express.Router();
const mysql = require('../utils/mysql');

/* 公共api */
router.get('/test', async (req, res, next) => {
  let ping = 0;
  let msg = '';
  let conn
  try {
    conn = await mysql.connect();
    await mysql.ping(conn);
    ping = 1;
  } catch (e) {
    if (e.message) msg = e.message;
  }
  mysql.release(conn);

  res.json({ code: 0, time: new Date().toISOString(), ping, msg });
});

module.exports = router;
