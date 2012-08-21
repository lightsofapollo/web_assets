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
          path('one.css'),
          path('two.css')
        ],

        jsTarget: 'out/build.css'
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
    var calledWith;

    setup(function() {
      calledWith = [];
    });

    test('simple concat', function(done) {
      var expected = '';
      var out = path('out/build.css');

      expected += fs.readFileSync(path('one.css'));
      expected += subject.outputJoin;
      expected += fs.readFileSync(path('two.css'));

      subject.postProcessAsset = function() {
        var cb = arguments[arguments.length - 1];
        calledWith.push(arguments);
        cb(null, arguments[0]);
      }

      subject.process(function() {
        var output = fs.readFileSync(out);
        try {
          assert.equal(output, expected);
          assert.equal(calledWith.length, 2);
        } catch (e) {
          done(e);
          return;
        }
        done();
      });
    });

  });

});


