const jwt = require('jsonwebtoken');
const security = require('../config/security');
const userStruct = {
  id: 0,
  name: ''
}

exports.verifyToken = (token, obj, user) => {
  if (!token || !obj || typeof obj !== 'object') return;
  jwt.verify(token, `${obj.id}${security.jwtsalt}`, (err, decoded) => {
    if (err) {
      console.log(err.message);
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