testSupport.lib('dom_queue');

suite('dom_queue', function() {

  var subject;

  setup(function() {
    subject = new WebAssets.DomQueue();
    subject.state = '';
  });

  suite('#queue', function() {

    test('when complete', function() {
      subject.state = 'complete';

      var calledWith;
      var fn = function() {
        calledWith = arguments;
      }

      subject.queue(fn, 1, 2);
      assert.deepEqual(calledWith, [1, 2]);
    });

    test('when not complete', function() {
      var fn = function() {};
      subject.queue(fn, 1, 2);

      assert.deepEqual(
        subject._queue,
        [[fn, 1, 2]]
      );
    });

  });

  test('#fireQueue', function() {
    var calledWith = [];
    var fn = function() {
      calledWith.push(arguments);
    };

    subject.queue(fn, 1, 2);
    subject.fireQueue();
    assert.deepEqual(calledWith, [
      [1, 2]
    ]);
    assert.deepEqual(subject._queue, []);
    assert.equal(subject.state, 'complete');
  });

  suite('#handleEvent', function() {
    test('with not DOMContentLoaded', function() {
      subject.handleEvent({});
      assert.equal(subject.state, '');
    });

    test('with DOMContentLoaded', function() {
      subject.handleEvent({ type: 'DOMContentLoaded' });
      assert.equal(subject.state, 'complete');
    });
  });

});
