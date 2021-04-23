const mysql = require('mysql');
const env = require('../config/env');
const logger = require('../utils/logger').getLogger('mysql');
const config = require('../config/database')[env.isProduction ? 'production' : 'dev']['mysql'];

const pool = mysql.createPool(config);

exports.ping = (conn) => {
  return new Promise((resolve, reject) => {
    if (!conn) {
      reject(new Error('no connection'))
      return
    }
    conn.ping((err) => {
      if (err) reject(err);
      else resolve(1);
    })
  })
}
exports.query = (sql, conn, values) => {
  return new Promise((resolve, reject) => {
    if (!conn) {
      reject(new Error('no connection'));
      return
    }
    if (!sql || typeof sql !== 'string') {
      reject(new Error('no sql string'));
      return
    }
    conn.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    })
  })
}
exports.connect = (cb) => {
  if (typeof cb == "function") {
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error(err.message ? err.message : 'pool.getConnection error');
      }
      cb(err, connection);
    });
  } else {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          logger.error(err.message ? err.message : 'pool.getConnection error');
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });
  }
}
exports.release = (conn) => {
  if (conn && typeof conn.release === 'function') conn.release();
}