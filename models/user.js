const jwt = require('jsonwebtoken');
const security = require('../config/security');
const logger = require('../utils/logger').getLogger('user');
const mysql = require('../utils/mysql');
const crypto = require('crypto');

const tableName = '`user`'
const createPassword = (password, id) => {
  const md5 = crypto.createHash('md5');
  return md5.update(`${password}${id}`).digest('hex');
}

exports.create = async (info) => {
  let conn;
  let id = 0;
  if (info && info.name && info.password) {
    try {
      conn = await mysql.connect();
      const res = await mysql.query('insert into ' + tableName + ' (`name`,`password`,`email`,`nick`,`create_time`,`login_time`) values (?,?,?,?,now(),now())', conn, [
        info.name,
        info.password,
        info.email,
        info.nick
      ]);
      if (res && res.affectedRows === 1) {
        id = res.insertId;
        await mysql.query('update ' + tableName + ' set `password`=? where `id`=' + id + ' limit 1', conn, createPassword(info.password, id));
      }
    } catch (e) {
      logger.info(`create:${info.name} - ${e.message}`);
    }
    mysql.release(conn);
  }
  return id;
}
exports.login = async (name, password) => {
  let conn;
  let user = false;
  if (!name || !password) return user;
  try {
    conn = await mysql.connect();
    const res = await mysql.query('select `id`,`name`,`password`,`nick` from ' + tableName + ' where `name`=? limit 1', conn, name);
    if (res.length && res[0].password && createPassword(password, res[0].id) === res[0].password) {
      const id = res[0].id;
      await mysql.query('update ' + tableName + ' set `login_time`=now() where `id`=' + id + ' limit 1', conn);
      user = {
        id,
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
exports.edit = async (id, password) => {
  let conn;
  let result = false;
  if (!id || !password) return false;
  try {
    conn = await mysql.connect();
    const res = await mysql.query('update ' + tableName + ' set `password`=? where `id`=? limit 1', conn, [createPassword(password, id), id]);
    result = !!(res && res.changedRows === 1);
  } catch (e) {
    logger.info(`edit:${id} - ${e.message}`);
  }
  mysql.release(conn);
  return result;
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