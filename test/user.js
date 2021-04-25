const assert = require('chai').assert;
const fetch = require("node-fetch");
const token = require('../utils/token');
const user = require('../models/user');
const url = 'http://localhost:3001';
const headers = {
  "Content-Type": "application/x-www-form-urlencoded"
}
const testUser = {
  id: 999,
  name: 'test'
}

describe('User', function() {
  describe('#signin', function() {
    it('正常登录', function(done) {
      const code = token.create();
      fetch(`${url}/user/login?_tk=${code}`, {
        method: 'POST',
        headers,
        body: "name=test&pwd=test"
      })
        .then((res) => {
          const cookieStr = res.headers.get('set-cookie');
          const hasUToken = /\bu_tk=\w{36}[^,]+?Expires=[^,]+?,[^,]+?HttpOnly,/.test(cookieStr);
          const hasUId = /\bu_id=\d{3,}[^,]+?Expires=[^,]+?,[^,]+?HttpOnly,/.test(cookieStr);
          const hasUName = /\bu_name=\w+/.test(cookieStr);
          assert.isTrue(hasUToken);
          assert.isTrue(hasUName);
          assert.isTrue(hasUId);
          assert.strictEqual(res.status, 200);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 0);
          assert.isString(res.token);
          assert.isObject(res.user);
          assert.strictEqual(res.user.name, 'test');
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
      fetch(`${url}/user/reg?_tk=${code}`, {
        method: 'POST',
        headers,
        body: `name=test${Math.floor(Date.now() / 1000)}&pwd=test`
      })
        .then((res) => {
          const cookieStr = res.headers.get('set-cookie');
          const hasUToken = /\bu_tk=\w{36}[^,]+?Expires=[^,]+?,[^,]+?HttpOnly,/.test(cookieStr);
          const hasUId = /\bu_id=\d{3,}[^,]+?Expires=[^,]+?,[^,]+?HttpOnly,/.test(cookieStr);
          const hasUName = /\bu_name=\w+/.test(cookieStr);
          assert.isTrue(hasUToken);
          assert.isTrue(hasUName);
          assert.isTrue(hasUId);
          assert.strictEqual(res.status, 200);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 0);
          assert.isString(res.token);
          assert.isObject(res.user);
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
          const hasUId = /\bu_id=[^,]+?Expires=[^,]+?,[^,]+?HttpOnly/.test(cookieStr);
          const hasUToken = /\bu_tk=[^,]+?Expires=[^,]+?,[^,]+?HttpOnly/.test(cookieStr);
          const match = cookieStr.match(/Expires=([^;]+)/);
          const time = new Date() - new Date(match[1]);
          assert.strictEqual(Math.floor(time / (24 * 3600 * 1000)), 7);
          assert.isTrue(hasUToken);
          assert.isTrue(hasUId);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 0);
          done();
        })
    })
  })
});