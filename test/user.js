const assert = require('chai').assert;
const fetch = require("node-fetch");
const token = require('../utils/token');
const url = 'http://localhost:3001';

describe('User', function() {
  describe('#signin', function(done) {
    it('正常登录', function(done) {
      const code = token.create();
      fetch(`${url}/user/login?_tk=${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: "name=test&pwd=test"
      })
        .then((res) => {
          assert.strictEqual(res.status, 200);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 0);
          done();
        })
    })
  })
  describe('#signup', function() {})
  describe('#edit', function() {})
});