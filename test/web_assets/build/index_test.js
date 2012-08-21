var Build = requireLib('build/index');
var fs = require('fs');

suite('build', function() {
  var root = __dirname + '/./fixtures';
  var out = {
    js: root + '/out/build.js',
    css: root + '/out/build.css'
  };

  var assetFile;
  var subject;

  function cleanupFiles() {
    if (fs.existsSync(out.js)) {
      fs.unlink(out.js);
    }

    if (fs.existsSync(out.css)) {
      fs.unlink(out.css);
    }
  }

  suite('run', function() {
    var expectedJS = [];
    var expectedCSS = [];

    suiteSetup(function() {
      expectedJS.push(fs.readFileSync(root + '/one.js'));
      expectedJS.push(fs.readFileSync(root + '/two.js'));
      expectedCSS.push(fs.readFileSync(root + '/one.css'));
      expectedCSS.push(fs.readFileSync(root + '/two.css'));
    });

    test('output', function(done) {

      Build.run(root, root + '/assets.json', function() {
        var buildCSS = fs.readFileSync(out.css);
        var buildJS = fs.readFileSync(out.js);

        assert.ok(buildJS);
        assert.ok(buildCSS);

        expectedCSS.forEach(function(item) {
          assert.include(buildCSS, item);
        });

        expectedJS.forEach(function(item) {
          assert.include(buildJS, item);
        });

        done();
      });
    });

  });

});
