var WebAssets = (function() {

  function Asset(file) {
    var config = new WebAssets.Config(file);
    var loader = new WebAssets.Loader();
    var dom = new WebAssets.DomQueue();

    var self = this;

    function load() {
      loader.load(function(err) {
        if (self.oncomplete)
          self.oncomplete();
      });
    }

    loader.onerror = function() {
      if (self.onerror) {
        self.onerror.apply(self, arguments);
      }
    }

    config.onsuccess = function() {
      config.css.forEach(function(item) {
        loader.css(item);
      });

      config.js.forEach(function(item) {
        loader.js(item);
      });

      dom.queue(load);
      dom.init();
    }
  }

  return Asset;
}());
