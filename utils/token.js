const security = require('../config/security');
const crypto = require('crypto');

function create(time, expires, salt) {
  const token = `${time}${expires}${security.salt}${salt}`;
  const md5 = crypto.createHash('md5');
  return `${time}_${md5.update(token).digest('hex')}_${expires}`;
}
exports.create = (expires = 7200, salt = '') => {
  return create(Date.now(), expires, salt);
}
exports.verify = (code, salt = '') => {
  if (code && typeof code === 'string') {
    const arr = code.split('_');
    if (arr.length === 3) {
      const time = Date.now();
      if (arr[0].length === String(time).length && arr[1].length === 32) {
        const last = +arr[0];
        const expires = +arr[2];
        if (!expires || last + expires * 1000 > time) {
          return code === create(last, expires, salt);
        }
      }
    }
  }
  return false
}