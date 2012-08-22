var fs = require('fs');
var fsPath = require('path');
var Build = requireLib('build/index');
var Asset = requireLib('build/asset');
var CSS = requireLib('build/css');

suite('build/css', function() {

  var subject;
  var build;

  function path(name) {
    return __dirname + '/fixtures/' + (name || '');
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

  suite('#_copyImage', function() {

    function cleanup() {
      var file = path('out/my');
      if (fs.existsSync(file))
        fs.rmdirSync(file);
    }

    setup(cleanup);
    teardown(cleanup);

    test('nested dir', function(done) {
      var details = {
        from: path('one.css'),
        to: 'my/other/thing/one.css'
      };

      var out = path('out/' + details.to);

      subject._copyImage(details, function() {
        assert.isTrue(fs.existsSync(out));
        var content = fs.readFileSync(out);
        assert.equal(content, fs.readFileSync(
          details.from
        ));
        done();
      });
    });

  });

  suite('#_filterRules', function() {

    // note that these are mostly
    // sanity checks the deep logic & tests
    // live in css_container

    test('without only & grep', function() {
      var input = '.a {}';
      var out = subject._filterRules(input, {});
      assert.equal(out, input);
    });

    test('property: only', function() {
      var input = '.a {}\n .b {}';
      var out = subject._filterRules(input, {
        only: ['.a']
      });

      assert.ok(out);
      assert.include(out, '.a');
      assert.ok(
        out.indexOf('.b') === -1,
        'should remove .b selector'
      );
    });

    test('property: inverseGrep', function() {
      var input = '.a {}\n .FOO {}';
      var out = subject._filterRules(input, {
        inverseGrep: '([a-z]+)'
      });

      assert.ok(out);
      assert.include(out, '.FOO');
      assert.ok(
        out.indexOf('.a') === -1,
        'should remove .a selector'
      );
    });

    test('property: grep', function() {
      var input = '.a {}\n .FOO {}';
      var out = subject._filterRules(input, {
        grep: '([a-z]+)'
      });

      assert.ok(out);
      assert.include(out, '.a');
      assert.ok(
        out.indexOf('.FOO') === -1,
        'should remove .FOO selector'
      );
    });

  });

  suite('#_findAndResolveImages', function() {

    test('data uri', function() {
      var domain = '/';
      source = '\n';
      source += 'url(\'data:foo\')';
      source += 'url(data:foo)';
      source += 'url("data:foo)';

      var output = subject._processSourceForImages(
        domain,
        source
      );

      assert.equal(output, source);
      assert.deepEqual(subject._imagesToCopy, []);
    });

    test('local assets - no copying', function() {
      var domain = 'style/';
      source = '\n';
      source += 'url(images/icon.png)';
      source += 'url(ui/button.png)';

      var output = subject._processSourceForImages(
        domain,
        source,
        'hopefully-ignored'
      );

      var expected = '\n';
      expected += 'url("style/images/icon.png")';
      expected += 'url("style/ui/button.png")';

      assert.equal(output, expected);
      assert.deepEqual(subject._imagesToCopy, []);
    });


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

