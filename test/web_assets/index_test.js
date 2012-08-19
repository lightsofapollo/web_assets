testSupport.lib('config');
testSupport.lib('dom_queue');
testSupport.lib('loader');

suite('web asset', function() {

  test('success', function(done) {
    var subject = new WebAssets('../test/fixtures/load.json');
    subject.oncomplete = function() {
      assert.ok(testSupport.getScript('file.js'));
      assert.ok(testSupport.getScript('file1.js'));

      assert.ok(testSupport.getLink('file.css'));
      assert.ok(testSupport.getLink('file1.css'));

      done();
    };
  });

});
