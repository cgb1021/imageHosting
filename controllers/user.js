const token = require('../utils/token');
const user = require('../models/user');
const logger = require('../utils/logger').getLogger('debug');
const siteConfig = require('../config/site');
const env = require('../config/env');
const base64 = require('../utils/base64');

const fn403 = (req, res) => {
  res.status(403);
  res.json({ code: 403 });
}
function loginSuccess(req, res, loginUser) {
  const defaultExpires = 14 * 24 * 60 * 60;
  const expires = req.query.expires && /^\d+$/.test(req.query.expires) ? Math.min(defaultExpires, Math.max(req.query.expires|0, 0)) : defaultExpires;
  const domain = env.isProduction ? siteConfig.domain : 'localhost';
  const userToken = user.createToken({
    id: loginUser.id,
    name: loginUser.name
  }, expires);
  res.cookie('u_id', loginUser.id, { expires: new Date(Date.now() + expires * 1000), domain, path: '/', httpOnly: true });
  res.cookie('u_tk', userToken, { expires: new Date(Date.now() + expires * 1000), domain, path: '/', httpOnly: true });
  res.cookie('u_name', loginUser.name, { expires: new Date(Date.now() + (expires + 604800)  * 1000), domain, path: '/' });
  res.cookie('u_nick', loginUser.nick, { expires: new Date(Date.now() + (expires + 604800)  * 1000), domain, path: '/' });

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
exports.edit = async (req, res) => {
  let code = 0, msg = '';
  const uid = +req.params.uid;
  const token = req.cookies.u_tk || req.headers['x-access-token'];
  let pass = false;
  let result = 0;
  if (!uid || !/^\d+$/.test(uid) || !token) {
    return fn403(req, res);
  }
  user.verifyToken(token, { id: uid }, (err) => {
    if (err) return;
    pass = true;
  })
  if (!pass) {
    return fn403(req, res);
  }
  try {
    const password = req.body.pwd ? req.body.pwd.trim() : '';
    if (!password) {
      throw new Error('no password');
    }
    result = await user.edit(uid, password);
  } catch (e) {
    code = 1;
    msg = e.message ? e.message : 'edit error';
    logger.error(e.stack);
  }
  res.json({
    code,
    result,
    msg
  });
}
exports.logout = async (req, res) => {
  let code = 0, msg = '';
  const expires = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const domain = env.isProduction ? siteConfig.domain : 'localhost';
  res.cookie('u_id', '', { expires, domain, path: '/', httpOnly: true });
  res.cookie('u_tk', '', { expires, domain, path: '/', httpOnly: true });
  res.json({
    code,
    msg
  });
}