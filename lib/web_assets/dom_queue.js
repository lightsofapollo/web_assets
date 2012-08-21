WebAssets.DomQueue = (function() {

  function DomQueue() {
    this.state = document.readyState;
    this._queue = [];
  }

  DomQueue.prototype = {
    init: function() {
      var state = document.readyState;
      if (state === 'complete' || state === 'interactive') {
        this.fireQueue();
      } else {
        window.addEventListener(
          'DOMContentLoaded', this, false
        );
      }
    },

    handleEvent: function(e) {
      if (e.type === 'DOMContentLoaded') {
        this.fireQueue();
      }
    },

    queue: function(fn, input) {
      var args = Array.prototype.slice.call(arguments, 1);
      if (this.state === 'complete') {
        fn.apply(null, args);
      } else {
        this._queue.push(arguments);
      }
    },

    fireQueue: function() {
      var item;
      this.state = 'complete';
      while ((item = this._queue.shift())) {
        // queue has code to handle the
        // case where the ;dom tree is ready.
        this.queue.apply(this, item);
      }
    }
  };

  return DomQueue;

}());
