const assert = require('chai').assert;
const fetch = require("node-fetch");
const token = require('../utils/token');
const user = require('../models/user');
const cookie = require('../utils/cookie');
const url = 'http://localhost:3001';
const headers = {
  "Content-Type": "application/x-www-form-urlencoded"
}
const testUser = {
  id: 999,
  name: 'test'
}
const testLoginSuccess = (step, cookies, res, name) => {
  if (step) {
    // 步骤2
    assert.strictEqual(res.code, 0);
    assert.isString(res.token);
    assert.strictEqual(res.token, cookies.u_tk.value);
    assert.isObject(res.user);
    assert.strictEqual(res.user.name, name);
    assert.strictEqual(cookies.u_name.value, name);
    assert.equal(res.user.id, cookies.u_id.value);
  } else {
    assert.strictEqual(res.status, 200);
    const hasUToken = typeof cookies['u_tk'] !== 'undefined';
    const hasUId = typeof cookies['u_id'] !== 'undefined';
    const hasUName = typeof cookies['u_name'] !== 'undefined';
    const hasNick = typeof cookies['u_nick'] !== 'undefined';
    assert.isTrue(hasUToken);
    assert.isTrue(hasUName);
    assert.isTrue(hasUId);
    assert.isTrue(hasNick);
    assert.strictEqual(cookies['u_tk'].expires, cookies['u_id'].expires);
    const days = Math.ceil((new Date(cookies['u_id'].expires) - new Date()) / (24 * 3600 * 1000));
    assert.isAtLeast(days, 7);
    assert.isAtMost(days, 14);
  }
}
describe('User', function() {
  describe('#signin', function() {
    it('正常登录', function(done) {
      const code = token.create();
      let cookies, expires = 7 * 24 * 3600;
      fetch(`${url}/user/login?_tk=${code}&expires=${expires}`, {
        method: 'POST',
        headers,
        body: "name=test&pwd=test"
      })
        .then((res) => {
          const cookieStr = res.headers.get('set-cookie');
          cookies = cookie.parse(cookieStr);
          testLoginSuccess(0, cookies, res);
          return res.json();
        })
        .then((res) => {
          testLoginSuccess(1, cookies, res, 'test');
          done();
        })
    })
    it('用户名不存在', function(done) {
      const code = token.create();
      fetch(`${url}/user/login?_tk=${code}`, {
        method: 'POST',
        headers,
        body: "name=t_t&pwd=test"
      })
        .then((res) => {
          assert.strictEqual(res.status, 200);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 0);
          assert.isNotString(res.token);
          assert.isNotObject(res.user);
          done();
        })
    })
    it('密码错误', function(done) {
      const code = token.create();
      fetch(`${url}/user/login?_tk=${code}`, {
        method: 'POST',
        headers,
        body: "name=test&pwd=test1"
      })
        .then((res) => {
          assert.strictEqual(res.status, 200);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 0);
          assert.isNotString(res.token);
          assert.isNotObject(res.user);
          done();
        })
    })
    it('没带token', function(done) {
      fetch(`${url}/user/login?_tk=`, {
        method: 'POST',
        headers,
        body: "name=test&pwd=test"
      })
        .then((res) => {
          assert.strictEqual(res.status, 200);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 403);
          done();
        })
    })
    it('token错误', function(done) {
      const code = token.create();
      fetch(`${url}/user/login?_tk=1${code}`, {
        method: 'POST',
        headers,
        body: "name=test&pwd=test"
      })
        .then((res) => {
          assert.strictEqual(res.status, 200);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 403);
          done();
        })
    })
    it('token正确', function(done) {
      const code = token.create();
      fetch(`${url}/user/login?_tk=${code}&expires=2`, {
        method: 'POST',
        headers,
        body: "name=test&pwd=test"
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          const user = res.user
          setTimeout(() => {
            fetch(`${url}/api/v2/${res.user.id}/test`, {
              headers: {
                "x-access-token": res.token,
                "x-access-name": 'test',
              }
            })
            .then((res) => {
              assert.strictEqual(res.status, 200);
              return res.json();
            })
            .then((res) => {
              delete user.nick;
              assert.strictEqual(res.code, 0);
              assert.deepEqual(res.user, user);
              done();
            })
          }, 1000);
        })
    })
    it('token过期', function(done) {
      this.timeout(3000);
      const code = token.create();
      fetch(`${url}/user/login?_tk=${code}&expires=2`, {
        method: 'POST',
        headers,
        body: "name=test&pwd=test"
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          setTimeout(() => {
            fetch(`${url}/api/v2/${res.user.id}/test`, {
              headers: {
                "x-access-token": res.token,
                "x-access-name": 'test',
              }
            })
            .then((res) => {
              assert.strictEqual(res.status, 403);
              return res.json();
            })
            .then((res) => {
              assert.strictEqual(res.code, 403);
              done();
            })
          }, 2100);
        })
    })
  })
  describe('#signup', function() {
    it('正常注册', function(done) {
      const code = token.create();
      const name = `test${Math.floor(Date.now() / 1000)}`;
      fetch(`${url}/user/reg?_tk=${code}`, {
        method: 'POST',
        headers,
        body: `name=${name}&pwd=test`
      })
        .then((res) => {
          const cookieStr = res.headers.get('set-cookie');
          cookies = cookie.parse(cookieStr);
          testLoginSuccess(0, cookies, res);
          return res.json();
        })
        .then((res) => {
          testLoginSuccess(1, cookies, res, name);
          done();
        })
    })
    it('重复用户名', function(done) {
      const code = token.create();
      fetch(`${url}/user/reg?_tk=${code}`, {
        method: 'POST',
        headers,
        body: `name=test&pwd=test`
      })
        .then((res) => {
          assert.strictEqual(res.status, 200);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 0);
          assert.isNotString(res.token);
          assert.isNotObject(res.user);
          done();
        })
    })
  })
  describe('#edit', function() {
    it('正常编辑', function(done) {
      const code = user.createToken(testUser, 1);
      const headers = {
        "x-access-token": code,
        "Content-Type": "application/x-www-form-urlencoded"
      }
      fetch(`${url}/user/${testUser.id}/edit`, {
        method: 'PUT',
        headers,
        body: "pwd=test1"
      })
        .then((res) => {
          assert.strictEqual(res.status, 200);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 0);
          assert.isTrue(res.result);
          done();
        })
    })
  })
  describe('#logout', function() {
    it('正常退出', function(done) {
      const code = user.createToken(testUser, 1);
      const headers = {
        "x-access-token": code,
        "x-access-name": testUser.name
      }
      fetch(`${url}/user/${testUser.id}/logout`, {
        headers
      })
        .then((res) => {
          assert.strictEqual(res.status, 200);
          const cookieStr = res.headers.get('set-cookie');
          const cookies = cookie.parse(cookieStr);
          const hasUToken = typeof cookies['u_tk'] !== 'undefined';
          const hasUId = typeof cookies['u_id'] !== 'undefined';
          assert.isTrue(hasUToken);
          assert.isTrue(hasUId);
          const time = new Date() - new Date(cookies['u_id'].expires);
          assert.strictEqual(cookies['u_tk'].expires, cookies['u_id'].expires);
          assert.strictEqual(Math.floor(time / (24 * 3600 * 1000)), 7);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 0);
          done();
        })
    })
  })
});