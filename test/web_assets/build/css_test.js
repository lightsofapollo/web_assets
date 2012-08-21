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

  suite('#_findAndResolveImages', function() {

    test('http url - no prefix', function() {
      var domain = 'http://google.com';
      source = '\n';
      source += '.foo {\n' + '  background: url(\'one.js\'); \n}\n';
      source += '.bar {\n' + '  background: url("two.js")' + '\n}\n';
      source += '.bar {\n  background: url(/foo/three.js)\n}\n';

      var output = subject._processSourceForImages(
        domain,
        source
      );

      assert.equal(output, source);

      var expected = [
        { from: domain + '/one.js', to: 'one.js' },
        { from: domain + '/two.js', to: 'two.js' },
        { from: domain + '/foo/three.js', to: '/foo/three.js' }
      ];

      assert.deepEqual(
        subject._imagesToCopy,
        expected
      );
    });

    test('absolute url - no prefix', function() {
      var domain = '/Users';
      source = '\n';
      source += '.foo {\n' + '  background: url(\'one.js\'); \n}\n';
      source += '.bar {\n' + '  background: url("two.js")' + '\n}\n';
      source += '.bar {\n  background: url(/foo/three.js)\n}\n';

      var output = subject._processSourceForImages(
        domain,
        source
      );

      var expected = [
        { from: domain + '/one.js', to: 'one.js' },
        { from: domain + '/two.js', to: 'two.js' },
        { from: '/foo/three.js', to: '/foo/three.js' }
      ];

      assert.deepEqual(
        subject._imagesToCopy,
        expected
      );
    });

    test('prefix http', function() {
      var domain = 'http://cool.com/';
      var input = 'url(foo.js)';
      var out = subject._processSourceForImages(
        domain,
        input,
        'cool'
      );

      assert.equal(
        out,
        'url("cool/foo.js")'
      );

      assert.deepEqual(
        subject._imagesToCopy,
        [
          { from: domain + '/foo.js', to: 'cool/foo.js' }
        ]
      );
    });

    test('prefix local', function() {
      var domain = '/root';
      var input = 'url(./foo.js)';
      var out = subject._processSourceForImages(
        domain,
        input,
        'cool'
      );

      assert.equal(
        out,
        'url("cool/foo.js")'
      );

      assert.deepEqual(
        subject._imagesToCopy,
        [
          { from: domain + '/foo.js', to: 'cool/foo.js' }
        ]
      );
    });

    test('integration', function() {
    });
  });

  suite('#process', function() {
    suite('simple concat', function() {
      testSupport.verifyBasicProcess(function() {
        return subject;
      });
    });
  });

});

