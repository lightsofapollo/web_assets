testSupport.lib('loader');

suite('loader', function() {
  var subject;

  function path(file) {
    return '../test/fixtures/' + file;
  }

  function getScript(file) {
    var el = document.querySelector(
      'script[src="' + path(file) + '"]'
    );

    return el;
  }

  function getLink(file) {
    var el = document.querySelector(
      'link[href="' + path(file) + '"]'
    );

    return el;
  }

  setup(function() {
    subject = new WebAssets.Loader();
  });

  suite('#initializer', function() {

    test('with doc', function() {
      var obj = {};
      subject = new WebAssets.Loader(obj);
      assert.equal(subject.doc, obj);
    });

    test('without doc', function() {
      assert.deepEqual(subject._cssAssets, []);
      assert.deepEqual(subject._jsAssets, []);
      assert.equal(subject.doc, window.document);
    });
  });

  test('#css', function() {
    subject.css('/foo.css');
    assert.deepEqual(
      subject._cssAssets, ['/foo.css']
    );
  });

  test('#js', function() {
    subject.js('/foo.js');
    assert.deepEqual(
      subject._jsAssets, ['/foo.js']
    );
  });

  suite('#_loadJs', function() {

    test('missing file', function(done) {
      var file = '../test/foo/file.js';
      subject._loadJs(file, function(err) {
        if (!err) {
          done(new Error('should throw an error'));
          return;
        }

        assert.instanceOf(err, Error);
        done();
      });
    });

    test('existing file', function(done) {
      var file = 'file.js';
      subject._loadJs(path(file), function(err) {
        if (err) {
          done(err);
          return;
        }

        // verify its in the document
        var el = getScript(file);
        assert.ok(el);
        assert.equal(
          el.getAttribute('type'),
          'text/javascript'
        );

        done();
      });
    });
  });

  suite('#_loadCss', function() {

    test('missing file', function(done) {
      var file = '../test/foo/file.css';
      subject._loadCss(file, function(err) {
        if (!err) {
          done(new Error('should throw an error'));
          return;
        }

        assert.instanceOf(err, Error);
        done();
      });
    });

    test('existing file', function(done) {
      var file = 'file.css';
      subject._loadCss(path(file), function(err) {
        if (err) {
          done(err);
          return;
        }

        // verify its in the document
        var el = getLink(file);
        assert.ok(el);
        assert.equal(
          el.getAttribute('rel'),
          'stylesheet'
        );

        assert.equal(
          el.getAttribute('type'),
          'text/css'
        );

        done();
      });
    });

  });

  suite('#load', function() {

    test('successfully loading', function(done) {
      var calledWith;

      subject.
        css(path('file.css')).
        css(path('file1.css')).
        js(path('file.js')).
        js(path('file1.js'));

      subject.oncomplete = function() {
        calledWith = arguments;
      }

      subject.load(function() {
        assert.ok(getScript('file.js'), 'should load file.js');
        assert.ok(getScript('file1.js'), 'should load file1.js');
        assert.ok(getLink('file.css'), 'should load file.css');
        assert.ok(getLink('file1.css'), 'should load file1.css');
        assert.ok(calledWith, 'should fire oncomplete');

        done();
      });
    });
  });

});
