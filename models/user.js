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
exports.verifyToken = (token, user, cb) => {
  if (!token || !user || typeof user !== 'object') return;
  jwt.verify(token, `${user.id}${security.jwtsalt}`, (err, decoded) => {
    if (err) {
      logger.info(`id:${user.id} - ${err.message}`);
    }
    if (typeof cb === 'function') cb(err);
  });
}
exports.createToken = (user, expires = 3600) => {
  const assignUser = {
    id: 0
  };
  for (let k in user) {
    if (k === 'id' || k === 'name') {
      assignUser[k] = user[k]
    }
  }
  if (!assignUser.id) return '';
  return jwt.sign(assignUser, `${assignUser.id}${security.jwtsalt}`, {
    expiresIn: expires
  });
}
exports.logout = () => {
}