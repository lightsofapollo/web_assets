suite('build/css_container', function() {
  var CSS = requireLib('build/vendor/css');

  var Container = requireLib('build/css_container');
  var fs = require('fs');
  var subject;

  function create(raw) {
    return new Container(raw);
  }

  function read(file) {
    var path = __dirname + '/fixtures/css/' + file;
    return fs.readFileSync(path);
  }

  function fromFixture(file) {
    return create(read(file));
  }

  function rules() {
    var list = subject.ast.stylesheet.rules;
    var ruleNames = [];

    list.forEach(function(item) {
      item.selectors.forEach(function(name) {
        ruleNames.push(name);
      });
    });

    return ruleNames;
  }

  function ruleToString(rule) {
    var obj = {
      stylesheet: {
        rules: [].concat(rule)
      }
    };
    return CSS.stringify(obj);
  }

  suite('initializing', function() {
    setup(function() {
      subject = fromFixture(
        'comments.css'
      );
    });

    test('many comments', function() {
      var list = rules().slice(0, 2);
      assert.deepEqual(
        list,
        ['.something', '.another']
      );
    });

    test('extra spaces', function() {
      var list = rules().slice(2, 3);
      assert.deepEqual(list, [
        '.few.too .many .spaces'
      ]);
    });

  });

  suite('#filter', function() {
    var ruleAst;
    var toRemove;

    function filter(selector, decl) {
      if (toRemove.indexOf(selector) === -1) {
        return true;
      }
      return false;
    };

    setup(function() {
      subject = fromFixture('filter.css');
      ruleAst = subject.ast.stylesheet.rules;
    });

    test('#inverseGrep', function() {
      subject.inverseGrep(/^\.(c|a)/);
      assert.deepEqual(
        rules(),
        ['.b', '.d', '.e', '.f']
      );
    });

    test('#grep', function() {
      subject.grep(/^\.(c|a)/);
      assert.deepEqual(
        rules(),
        ['.a', '.c']
      );
    });

    test('#inverseGrep - array string', function() {
      subject.inverseGrep(['\.a', '\.c']);
      assert.deepEqual(
        rules(),
        ['.b', '.d', '.e', '.f']
      );
    });

    test('#only', function() {
      subject.only(['.a', '.d']);
      assert.deepEqual(
        rules(),
        ['.a', '.d']
      );
    });

    test('trim two selectors of multiple', function() {
      toRemove = ['.a', '.c'];
      subject.filter(filter);


      assert.equal(ruleAst.length, 4);
      assert.deepEqual(
        ruleAst[0].selectors,
        ['.b']
      );
    });

    test('trim single selector of multiple', function() {
      toRemove = ['.b'];
      subject.filter(filter);

      assert.equal(ruleAst.length, 4);
      assert.deepEqual(
        ruleAst[0].selectors,
        ['.a', '.c']
      );

    });

    test('remove entire selector', function() {
      toRemove = [
        '.a', '.b', '.c', '.e', '.f'
      ];

      var expectedStr = ruleToString(
        ruleAst[1]
      );


      subject.filter(filter);

      assert.equal(ruleAst.length, 1);
      assert.deepEqual(
        ruleAst[0].selectors,
        ['.d']
      );

      assert.equal(subject.toString(), expectedStr);
    });
  });

});
