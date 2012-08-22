suite('vendor', function() {
  suite('css', function() {
    var input = '.selector{color:#333}';
    var CSS = {
      parse: requireLib('build/vendor/css-parse'),
      stringify: requireLib('build/vendor/css-stringify')
    };

    test('css-parse', function() {
      var output = CSS.parse(input);
      assert.ok(output.stylesheet);

      var rules = output.stylesheet.rules[0];
      var selectors = rules.selectors;
      var decl = rules.declarations;

      assert.deepEqual(selectors, ['.selector']);
      assert.deepEqual(decl, [{ property: 'color', value: '#333' }]);
    });

    test('css-stringify', function() {
      var parsed = CSS.parse(input);
      var output = CSS.stringify(parsed, {
        compress: true
      });
      assert.deepEqual(output, input);
    });

  });
});
