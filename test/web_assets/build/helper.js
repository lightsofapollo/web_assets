var isNode = (typeof(window) === 'undefined');

if (isNode) {
  chai = global.chai = require('chai');
} else {
  importScripts(__dirname + '/../../../vendor/chai.js');
  global.chai = chai;

  function chaiAssert(expr, msg, negateMsg, expected, actual) {
    actual = actual || this.obj;
    var msg = (this.negate ? negateMsg : msg),
        ok = this.negate ? !expr : expr;

    if (!ok) {
      throw new Error(
        // include custom message if available
        this.msg ? this.msg + ': ' + msg : msg
      );
    }
  }

  chai.Assertion.prototype.assert = chaiAssert;
}

assert = global.assert = chai.assert;
chai.includeStack = true;

global.requireLib = function(file) {
  return require('../../../lib/web_assets/' + file);
};
