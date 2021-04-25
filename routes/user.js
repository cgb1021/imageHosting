const express = require('express');
const router = express.Router();
const user = require('../controllers/user');

/* GET users listing. */
router.post('/login', user.login);
router.post('/reg', user.reg);
router.get('/logout', user.logout);

module.exports = router;
