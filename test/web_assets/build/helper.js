var isNode = (typeof(window) === 'undefined');
var fsPath = require('path');
var fs = require('fs');

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

global.testSupport = {
  verifyBasicProcess: function(fn) {
    var calledWith = [];
    var files;
    var asset;
    var expected;
    var outputFile;

    function unlink() {
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
    }

    setup(function() {
      asset = fn();
      var inputProp = asset.inputProperty;
      var outputProp = asset.outputProperty;
      var assets = asset.assets;

      files = assets[inputProp];
      outputFile = fsPath.resolve(
        asset.build.root, assets[outputProp]
      );

      var joinWith = asset.outputJoin;

      expected = [];
      files.forEach(function(file) {
        var path = fsPath.resolve(asset.build.root, file);
        var content = fs.readFileSync(file);
        assert.ok(content, 'test file: "' + file + '" should have content');
        expected.push(content);
      });
      expected = expected.join(joinWith);
    });

    setup(unlink);
    teardown(unlink);

    test('simple concat process', function(done) {
      var calledWith = [];
      asset.postProcessAsset = function() {
        var cb = arguments[arguments.length - 1];
        calledWith.push(arguments);
        cb(null, arguments[0]);
      }

      asset.process(function() {
        var output = fs.readFileSync(outputFile);
        try {
          assert.equal(output, expected);
          assert.equal(calledWith.length, 2);
        } catch(e) {
          done(e);
          return;
        }
        done();
      });
    });

  }
};
