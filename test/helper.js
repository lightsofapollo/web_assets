(function() {

  window.navigator;
  var specialRequires = {
    'chai': requireChai
  };

  testSupport = {
    isNode: (typeof(window) === 'undefined')
  };

  /* cross require */

  testSupport.require = function cross_require(file, callback) {
    if (file in specialRequires) {
      return specialRequires[file](file, callback);
    }

    if (!(/\.js$/.test(file))) {
      file += '.js';
    }

    if (typeof(window) === 'undefined') {
      var lib = require(__dirname + '/../' + file);
      if (typeof(callback) !== 'undefined') {
        callback(lib);
      }
    } else {
      window.require(file, callback);
    }
  }

  function setupChai(chai) {
    chai.Assertion.includeStack = true;
    assert = chai.assert;
  }

  function requireChai(file, callback) {
    var path;
    if (testSupport.isNode) {
      setupChai(require('chai'));
    } else {
      require('/vendor/chai.js', function() {
        setupChai(chai);
      });
    }
  }

  testSupport.require('chai');

  testSupport.lib = function(lib, callback) {
     testSupport.require('/lib/web_assets/' + lib, callback);
  };

  testSupport.helper = function(lib) {
    testSupport.require('/test/support/' + lib);
  }

  testSupport.path = function path(file) {
    return '../test/fixtures/' + file;
  }

  testSupport.getScript = function getScript(file) {
    console.log()
    var el = document.querySelector(
      'script[src="' + testSupport.path(file) + '"]'
    );

    return el;
  }

  testSupport.getLink = function getLink(file) {
    var el = document.querySelector(
      'link[href="' + testSupport.path(file) + '"]'
    );

    return el;
  }



  testSupport.lib('index');

}());
