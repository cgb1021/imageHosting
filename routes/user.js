const express = require('express');
const router = express.Router();
const mysql = require('../utils/mysql');

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

module.exports = router;
