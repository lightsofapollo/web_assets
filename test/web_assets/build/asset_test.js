var fs = require('fs');
var fsPath = require('path');
var Build = requireLib('build/index');
var Asset = requireLib('build/asset');

suite('build/asset', function() {

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

    subject = new Asset(build);
    subject.inputProperty = 'css';
    subject.outputProperty = 'cssTarget';
  });

  test('initialization', function() {
    assert.equal(subject.build, build);
  });

  suite('#readAssetSrc', function() {

    test('relative local path', function(done) {
      var expected = fs.readFileSync(path('one.css'));
      assert.ok(expected);

      subject.readAssetSrc(path('one.css'), function(err, data) {
        assert.equal(data, expected);
        done();
      });
    });

    test('remote path', function(done) {
      // hopefully this does not go away
      var url = 'https://raw.github.com/lightsofapollo/' +
                 'js-test-agent/297bada619e487690c3fcb443d6d914201e320dc/test-agent.css';


      subject.readAssetSrc(url, function(err, data) {
        assert.ok(data);
        assert.include(data, '#test-agent-ui');
        done();
      });
    });

  });

  suite('#process', function() {
    suite('simple concat', function() {
      testSupport.verifyBasicProcess(function() {
        return subject;
      });
    });
  });

  suite('#assetOptions', function() {

    test('as object', function() {
      var obj = { src: 'foo.css' };
      var opts = subject.assetOptions(obj);

      assert.deepEqual(opts, obj);
    });

    test('as string', function() {
      var opts = subject.assetOptions('foo.css');
      assert.deepEqual(opts, {
        src: 'foo.css'
      });
    });

  });

});
