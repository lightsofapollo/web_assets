var fs = require('fs');
var fsPath = require('path');
var Build = requireLib('build/index');
var Asset = requireLib('build/asset');
var JS = requireLib('build/js');

suite('build/js', function() {

  var subject;
  var build;

  function path(name) {
    return __dirname + '/./fixtures/' + (name || '');
  }

  setup(function() {
    build = new Build(
      path(), {
        js: [
          path('one.js'),
          path('two.js')
        ],

        jsTarget: 'out/build.js'
      }
    );

    subject = new JS(build);
  });

  test('initialization', function() {
    assert.instanceOf(subject, Asset);
    assert.instanceOf(subject, JS);

    assert.equal(subject.build, build);
    assert.equal(subject.outputJoin, '\n;');
  });

  suite('#process', function() {
    suite('simple concat', function() {
      testSupport.verifyBasicProcess(function() {
        return subject;
      });
    });
  });

});


