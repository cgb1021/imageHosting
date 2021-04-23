const assert = require('chai').assert;
const fetch = require("node-fetch");
const token = require('../utils/token');
const user = require('../models/user');
const url = 'http://localhost:3001/api';

describe('API', function() {
  describe('#v0', function() {
    it('test', function(done) {
      fetch(`${url}/test`)
      .then((res) => {
        assert.strictEqual(res.status, 200);
        return res.json();
      })
      .then((res) => {
        assert.strictEqual(res.code, 0);
        assert.strictEqual(res.ping, 1);
        done();
      })
    })
  })
  describe('#v1', function() {
    it('不带token', function(done) {
      fetch(`${url}/v1/test`)
      .then((res) => {
        assert.strictEqual(res.status, 403);
        return res.json();
      })
      .then((res) => {
        assert.strictEqual(res.code, 403);
        done();
      })
    })
    it('带错误的token', function(done) {
      fetch(`${url}/v1/test?_tk=412374081203748210934`)
      .then((res) => {
        assert.strictEqual(res.status, 403);
        return res.json();
      })
      .then((res) => {
        assert.strictEqual(res.code, 403);
        done();
      })
    })
    it('带正确的token', function(done) {
      const code = token.create();
      fetch(`${url}/v1/test?_tk=${code}`)
      .then((res) => {
        assert.strictEqual(res.status, 200);
        return res.json();
      })
      .then((res) => {
        assert.strictEqual(res.code, 0);
        done();
      })
    })
    it('token超时', function(done) {
      const code = token.create(1);
      setTimeout(() => {
        fetch(`${url}/v1/test?_tk=${code}`)
        .then((res) => {
          assert.strictEqual(res.status, 403);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 403);
          done();
        })
      }, 1200)
    })
  })
  describe('#v2', function() {
    const testUser = {
      id: 999,
      name: 'test'
    }
    it('不带uid', function(done) {
      fetch(`${url}/v2/test`)
      .then((res) => {
        assert.strictEqual(res.status, 404);
        done();
      })
    })
    it('带uid没带token', function(done) {
      fetch(`${url}/v2/${testUser.id}/test`)
      .then((res) => {
        assert.strictEqual(res.status, 403);
        return res.json();
      })
      .then((res) => {
        assert.strictEqual(res.code, 403);
        done();
      })
    })
    it('带uid带token', function(done) {
      const code = user.createToken(testUser);
      const headers = {
        "x-access-token": code,
        "x-access-name": testUser.name,
      }
      fetch(`${url}/v2/${testUser.id}/test`, {
        headers
      })
      .then((res) => {
        assert.strictEqual(res.status, 200);
        return res.json();
      })
      .then((res) => {
        assert.strictEqual(res.code, 0);
        assert.deepEqual(res.user, testUser);
        done();
      })
    })
    it('带uid带token超时', function(done) {
      const code = user.createToken(testUser, 1);
      const headers = {
        "x-access-token": code,
        "x-access-name": testUser.name,
      }
      setTimeout(() => {
        fetch(`${url}/v2/${testUser.id}/test`, {
          headers
        })
        .then((res) => {
          assert.strictEqual(res.status, 403);
          return res.json();
        })
        .then((res) => {
          assert.strictEqual(res.code, 403);
          done();
        })
      }, 1200)
    })
  })
});