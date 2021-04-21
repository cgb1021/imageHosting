const security = require('../config/security');
const crypto = require('crypto');

exports.create = (salt = '', expires = 0) => {
  const time = Date.now();
  const token = `${time}${expires}${security.salt}${salt}`;
  const md5 = crypto.createHash('md5');

  return `${time}_${md5.update(token).digest('hex')}_${expires}`;
}
exports.verify = (code, salt = '') => {
  if (code && typeof code === 'string') {
    const arr = code.split('_');
    if (arr.length === 3) {
      const time = Date.now();
      if (arr[0].length === String(time).length) {
        const last = +arr[0];
        const expires = +arr[2];
        if (!expires || last + expires > time) {
          const token = `${last}${expires}${security.salt}${salt}`;
          const md5 = crypto.createHash('md5');

          return code === `${last}_${md5.update(token).digest('hex')}_${expires}`;
        }
      }
    }
  }
  return false
}