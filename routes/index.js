const express = require('express');
const router = express.Router();
const index = require('../controllers/index')

/* GET home page. */
router.get('/', (req, res, next) => {
  index.main(req, res)
});

module.exports = router;
