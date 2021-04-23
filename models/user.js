const jwt = require('jsonwebtoken');
const security = require('../config/security');
const logger = require('../utils/logger').getLogger('user');
const mysql = require('../utils/mysql');
const crypto = require('crypto');
const userStruct = {
  id: 0,
  name: ''
}

const createPassword = (password, id) => {
  const md5 = crypto.createHash('md5');
  return md5.update(`${password}${id}`).digest('hex');
}
exports.login = async (name, password) => {
  let conn;
  let user = false;
  if (!name || !password) return user;
  try {
    conn = await mysql.connect();
    const res = await mysql.query('select `id`,`name`,`password`,`nick` from `user` where `name`=? limit 1', conn, name);
    if (res.length && res[0].password && createPassword(password, res[0].id) === res[0].password) {
      user = {
        id: res[0].id,
        name: res[0].name,
        nick: res[0].nick
      }
    }
  } catch (e) {
    logger.info(`login:${name} - ${e.message}`);
  }
  mysql.release(conn);
  return user;
}
exports.verifyToken = (token, obj, user) => {
  if (!token || !obj || typeof obj !== 'object') return;
  jwt.verify(token, `${obj.id}${security.jwtsalt}`, (err, decoded) => {
    if (err) {
      logger.info(`id:${obj.id} - ${err.message}`);
      return;
    }
    if (user && typeof user === 'object') {
      for (const k in obj) {
        const type = typeof userStruct[k];
        if (type !== 'undefined' && type === typeof obj[k]) {
          user[k] = obj[k];
          if (k === 'id' || k === 'name') {
            Object.defineProperty(user, k, {
              writable: false
            })
          }
        }
      }
    }
  });
}
exports.createToken = (user, expires = 3600) => {
  if (typeof expires !== 'number') {
    expires = 3600;
  } else {
    expires = Math.min(30 * 24 * 60 * 60, Math.max(expires|0, 0))
  }
  return jwt.sign(Object.assign({}, user), `${user.id}${security.jwtsalt}`, {
    expiresIn: expires
  });
}
exports.logout = () => {
}