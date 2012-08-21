var fs = require('fs');
var fsPath = require('path');
var Build = requireLib('build/index');
var Asset = requireLib('build/asset');
var JS = requireLib('build/css');

suite('build/js', function() {

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

    subject = new JS(build);
  });

  test('initialization', function() {
    assert.instanceOf(subject, Asset);
    assert.equal(subject.build, build);
  });

  suite('#process', function() {
    var calledWith;

    setup(function() {
      calledWith = [];
    });

    test('simple concat', function(done) {
      var expected = '';
      var out = path('out/build.css');

      expected += fs.readFileSync(path('one.css'));
      expected += '\n';
      expected += fs.readFileSync(path('two.css'));

      subject.postProcessAsset = function() {
        var cb = arguments[arguments.length - 1];
        calledWith.push(arguments);
        cb(null, arguments[0]);
      }

      subject.process(function() {
        var output = fs.readFileSync(out);
        assert.equal(output, expected);
        assert.equal(calledWith.length, 2);
        done();
      });
    });

  });

});


