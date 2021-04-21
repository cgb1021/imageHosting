const token = require('../utils/token');

exports.main = (req, res) => {
  const __server = {
    token: `${token.create()}`
  }
  res.render('index', { __server });
};