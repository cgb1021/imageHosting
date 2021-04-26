var cookie = require('cookie');
exports.parse = (str) => {
  const cookies = {};
  let tmp = str.split(/(?<!xpires=\w+),\s*/g);
  tmp.forEach((str) => {
    const arr = str.split(/\s*;\s*/g);
    let name, value, domain, path, expires, http, secure;
    arr.forEach((str) => {
      const arr = str.split('=');
      switch (arr[0]) {
        case 'Domain': domain = arr[1];
          break;
        case 'Path': path = arr[1];
          break;
        case 'Expires': expires = arr[1];
          break;
        case 'HttpOnly': http = true;
          break;
        case 'Secure': secure = true;
          break;
        default: name = arr[0];
          value = arr[1];
      }
    })
    cookies[name] = {
      value,
      domain,
      path,
      expires,
      http,
      secure
    }
  })
  return cookies;
}