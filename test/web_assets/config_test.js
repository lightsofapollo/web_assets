testSupport.lib('config');

suite('index', function() {

  suite('Config', function() {

    test('success - simple file', function(done) {
      var file = new WebAssets.Config(
        '../test/fixtures/asset.json'
      );

      file.onerror = done;
      file.onsuccess = function() {
        assert.deepEqual(file.css, ['http://foo.com']);
        done();
      };
    });

    test('error - invalid json', function(done) {
      var file = new WebAssets.Config(
        '../test/fixtures/error.json'
      );

      file.onerror = function(e) {
        assert.ok(e.message);
        assert.include(e.message, 'json');
        assert.instanceOf(e, Error);
        done();
      }
    });

    test('error - missing file', function(done) {
      var file = new WebAssets.Config(
        '/foo/bar'
      );

      file.onerror = function() {
        done();
      }

      file.onsuccess = function() {
        done(new Error(
          'missing file should not fire success'
        ));
      }
    });

  });

});
