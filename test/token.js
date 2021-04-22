const assert = require('chai').assert;
const token = require('../utils/token');

describe('Token', function() {
  const code = token.create(0);
  describe('#create', function() {
    const arr = code.split('_');
    it('token length = 48', function() {
      assert.strictEqual(code.length, 48);
    });
    it('token include 2 "_"', function() {
      assert.strictEqual(arr.length, 3);
    });
    it('split array[0] is 13 number', function() {
      const b = /^\d{13}$/.test(arr[0]);
      assert.isTrue(b);
    });
    it('split array[1].length = 32', function() {
      const b = /^\w{32}$/.test(arr[1]);
      assert.isTrue(b);
    });
    it('split array[2].length >= 1', function() {
      const b = /^\d{1,}$/.test(arr[2]);
      assert.isTrue(b);
    });
  });
  describe('#verify', function() {
    const code2 = token.create(2);
    this.timeout(4000);
    it('verify pass', function() {
      const b = token.verify(code);
      assert.isTrue(b);
    });
    it('verify not pass at 0', function() {
      const b = token.verify(`1${code}`);
      assert.isFalse(b);
    });
    it('verify not pass at 1', function() {
      const newCode = code.replace(/_(\w)/, '_a$1');
      const b = token.verify(newCode);
      assert.isFalse(b);
    });
    it('verify not pass at 2', function() {
      const b = token.verify(`${code}1`);
      assert.isFalse(b);
    });
    it('verify 1s timeout pass', function(done) {
      setTimeout(() => {
        const b = token.verify(code2);
        assert.isTrue(b);
        done();
      }, 1000)
    });
    it('verify 3s timeout not pass', function(done) {
      setTimeout(() => {
        const b = token.verify(code2);
        assert.isFalse(b);
        done();
      }, 3000)
    });
  })
});