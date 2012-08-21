var fs = require('fs');
var fsPath = require('path');
var Build = requireLib('build/index');
var Asset = requireLib('build/asset');
var CSS = requireLib('build/css');

suite('build/css', function() {

  var subject;
  var build;

  function path(name) {
    return __dirname + '/./fixtures/' + (name || '');
  }

  setup(function() {
    build = new Build(
      path(), {
        css: [
          path('one.css'),
          path('two.css')
        ],

        cssTarget: 'out/build.css'
      }
    );

    subject = new CSS(build);
  });

  test('initialization', function() {
    assert.instanceOf(subject, Asset);
    assert.equal(subject.build, build);
  });

  suite('#process', function() {
    suite('simple concat', function() {
      testSupport.verifyBasicProcess(function() {
        return subject;
      });
    });
  });

});

