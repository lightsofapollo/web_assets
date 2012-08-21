var fs = require('fs');

suite('build/copier', function() {
  var copier = requireLib('build/copier');

  function read(file) {
    return fs.readFileSync(file);
  }

  suite('#copy', function() {
    var out = __dirname + '/fixtures/out/file.txt';
    var a = __dirname + '/fixtures/one.css';
    var b = __dirname + '/fixtures/two.css';

    teardown(function() {
      if (fs.existsSync(out))
        fs.unlinkSync(out);
    });

    setup(function(done) {
      copier.copy(a, out, done);
    });

    test('over http', function(done) {
      var src = 'https://raw.github.com/mozilla-b2g' +
                '/gaia/5293028c65db0a787320ca45555a' +
                'c17acf28753a/.gitignore';

      copier.copy(src, out, function() {
        var content = read(out);
        assert.ok(content);
        assert.include(content, 'manifest.appcache');
        done();
      });
    });

    test('initial copy', function() {
      assert.equal(
        read(out),
        read(a),
        'should copy contents of a into out'
      );
    });

    test('override', function(done) {
      copier.copy(b, out, function() {
        assert.equal(
          read(out),
          read(b),
          'should override existing copy'
        );
        done();
      });
    });

  });

});
