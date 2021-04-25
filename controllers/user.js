const token = require('../utils/token');
const user = require('../models/user');
const logger = require('../utils/logger').getLogger('debug');
const siteConfig = require('../config/site');
const env = require('../config/env');

exports.login = async (req, res) => {
  if (!token.verify(req.query._tk)) {
    return res.json({ code: 403 });
  }
  let code = 0, userToken;
  let loginUser = null;
  let msg = '';
  try {
    const name = req.body.name.trim();
    const password = req.body.pwd.trim();
    if (!/^\w+$/.test(name)) {
      throw new Error('no name');
    }
    if (!password) {
      throw new Error('no password');
    }
    const result = await user.login(name, password);
    if (result) {
      loginUser = {
        id: result.id,
        name: result.name
      }
      const defaultExpires = 14 * 24 * 60 * 60;
      const expires = req.query.expires && /^\d+$/.test(req.query.expires) ? Math.min(defaultExpires, Math.max(req.query.expires|0, 0)) : defaultExpires;
      const domain = env.isProduction ? siteConfig.domain : 'localhost';
      userToken = user.createToken(Object.assign({}, loginUser), expires);
      loginUser.nick = result.nick;
      res.cookie('u_id', result.id, { expires: new Date(Date.now() + expires), domain, path: '/', httpOnly: true });
      res.cookie('u_tk', userToken, { expires: new Date(Date.now() + expires), domain, path: '/', httpOnly: true });
      res.cookie('u_name', result.name, { expires: new Date(Date.now() + expires + 604800), domain, path: '/' });
      res.cookie('u_nick', result.nick, { expires: new Date(Date.now() + expires + 604800), domain, path: '/' });
    }
  } catch (e) {
    code = 1;
    msg = e.message ? e.message : 'login error'
    logger.error(msg);
  }
  res.json({
    code,
    msg,
    token: userToken,
    user: loginUser
  });
};