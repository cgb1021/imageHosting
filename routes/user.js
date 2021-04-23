const express = require('express');
const router = express.Router();
const user = require('../controllers/user');

/* GET users listing. */
router.post('/login', user.login);

module.exports = router;
