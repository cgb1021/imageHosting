const token = require('../utils/token');
const user = require('../models/user');
const logger = require('../utils/logger').getLogger('debug');
const siteConfig = require('../config/site');
const env = require('../config/env');
const base64 = require('../utils/base64');

function loginSuccess(req, res, loginUser) {
  const defaultExpires = 14 * 24 * 60 * 60;
  const expires = req.query.expires && /^\d+$/.test(req.query.expires) ? Math.min(defaultExpires, Math.max(req.query.expires|0, 0)) : defaultExpires;
  const domain = env.isProduction ? siteConfig.domain : 'localhost';
  const userToken = user.createToken({
    id: loginUser.id,
    name: loginUser.name
  }, expires);
  res.cookie('u_id', loginUser.id, { expires: new Date(Date.now() + expires), domain, path: '/', httpOnly: true });
  res.cookie('u_tk', userToken, { expires: new Date(Date.now() + expires), domain, path: '/', httpOnly: true });
  res.cookie('u_name', loginUser.name, { expires: new Date(Date.now() + expires + 604800), domain, path: '/' });
  res.cookie('u_nick', loginUser.nick, { expires: new Date(Date.now() + expires + 604800), domain, path: '/' });

  return userToken;
}
exports.login = async (req, res) => {
  if (!token.verify(req.query._tk)) {
    return res.json({ code: 403 });
  }
  let code = 0, userToken;
  let loginUser = null;
  let msg = '';
  try {
    const name = req.body.name ? req.body.name.trim() : '';
    const password = req.body.pwd ? req.body.pwd.trim() : '';
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
        name: result.name,
        nick: result.nick
      }
      userToken = loginSuccess(req, res, loginUser);
    }
  } catch (e) {
    code = 1;
    msg = e.message ? e.message : 'login error';
    logger.error(e.stack);
  }
  res.json({
    code,
    msg,
    token: userToken,
    user: loginUser
  });
};
exports.reg = async (req, res) => {
  if (!token.verify(req.query._tk)) {
    return res.json({ code: 403 });
  }
  let code = 0, userToken;
  let loginUser = null;
  let msg = '';
  try {
    const defaultNick = `n${Date.now()}${Math.floor(Math.random() * 100)}`;
    const name = req.body.name ? req.body.name.trim() : '';
    const password = req.body.pwd ? req.body.pwd.trim() : '';
    const email = req.body.email ? req.body.email.trim() : `${defaultNick}@c.gb`;
    const nick = base64.encode(req.body.nick ? req.body.nick.trim(): defaultNick);
    if (!/^\w+$/.test(name)) {
      throw new Error('no name');
    }
    if (!password) {
      throw new Error('no password');
    }
    const result = await user.create({
      name,
      password,
      email,
      nick
    });
    if (result) {
      loginUser = {
        id: result,
        name,
        nick
      }
      userToken = loginSuccess(req, res, loginUser);
    }
  } catch (e) {
    code = 1;
    msg = e.message ? e.message : 'reg error';
    logger.error(e.stack);
  }
  res.json({
    code,
    msg,
    token: userToken,
    user: loginUser
  });
}
exports.logout = async (req, res) => {}