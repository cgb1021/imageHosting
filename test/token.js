const assert = require('chai').assert;
const token = require('../utils/token');

describe('Token', function() {
  const code = token.create(0);
  describe('#create', function() {
    const arr = code.split('_');
    it('总长度48', function() {
      assert.strictEqual(code.length, 48);
    });
    it('包含2个"_"', function() {
      assert.strictEqual(arr.length, 3);
    });
    it('位置1包含13个数字', function() {
      const b = /^[1-9]\d{12}$/.test(arr[0]);
      assert.isTrue(b);
    });
    it('位置2包含32个字符', function() {
      const b = /^\w{32}$/.test(arr[1]);
      assert.isTrue(b);
    });
    it('位置3个数>=1', function() {
      const b = /^\d{1,}$/.test(arr[2]);
      assert.isTrue(b);
    });
  });
  describe('#verify', function() {
    it('不设有效期检查通过', function() {
      const b = token.verify(code);
      assert.isTrue(b);
    });
    it('位置1检查不通过', function() {
      const b = token.verify(`1${code}`);
      assert.isFalse(b);
    });
    it('位置2长度检查不通过', function() {
      const newCode = code.replace(/_(\w)/, '_a$1');
      const b = token.verify(newCode);
      assert.isFalse(b);
    });
    it('位置2检查不通过', function() {
      const newCode = code.replace(/_\w{5}/, '_aaaaa');
      const b = token.verify(newCode);
      assert.isFalse(b);
    });
    it('位置3检查不通过', function() {
      const b = token.verify(`${code}1`);
      assert.isFalse(b);
    });
    it('2秒有效期用1秒超时检查通过', function(done) {
      const code2 = token.create(2);
      setTimeout(() => {
        const b = token.verify(code2);
        assert.isTrue(b);
        done();
      }, 1000)
    });
    it('2秒有效期用3秒超时检查不通过', function(done) {
      this.timeout(3000);
      const code2 = token.create(2);
      setTimeout(() => {
        const b = token.verify(code2);
        assert.isFalse(b);
        done();
      }, 2500)
    });
  })
});