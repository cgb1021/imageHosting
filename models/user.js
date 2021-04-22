const jwt = require('jsonwebtoken');
const security = require('../config/security');
const userStruct = {
  id: 0,
  name: ''
}

exports._makeTestUser = () => {
  return {
    id: 999,
    name: 'test'
  }
}
exports.verifyToken = (obj, token, user) => {
  if (typeof obj !== 'object' || !obj || !token) return;
  jwt.verify(token, `${obj.id}${security.jwtsalt}`, (err, decoded) => {
    if (err) {
      console.log(err.message);
      return;
    }
    if (typeof user === 'object' && user) {
      for (const k in obj) {
        const type = typeof userStruct[k];
        if (type !== 'undefined' && type === typeof obj[k]) {
          user[k] = obj[k];
        }
      }
    }
  });
}
exports.createToken = (user, expires = 3600) => {
  return jwt.sign(Object.assign({}, user), `${user.id}${security.jwtsalt}`, {
    expiresIn: Math.max(expires, 0)
  });
}
exports.logout = () => {
}