const token = require('../utils/token');
const user = require('../models/user');
const logger = require('../utils/logger').getLogger('debug');

exports.login = async (req, res) => {
  if (!token.verify(req.query._tk)) {
    return res.json({ code: 403 });
  }
  let code = 0, userToken;
  try {
    const res = await user.login(req.body.name, req.body.pwd);
    console.log(res);
  } catch (e) {
    code = 1;
    logger.error(e.message ? e.message : 'login error');
  }
  res.json({code, token: userToken});
};