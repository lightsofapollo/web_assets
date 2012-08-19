var WebAssets = (function() {

  function Asset(file) {
    var config = new WebAssets.Config(file);
    var loader = new WebAssets.Loader();
    var self = this;

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

      loader.load(function(err) {
        if (self.oncomplete)
          self.oncomplete();
      });
    }
  }

  return Asset;
}());
WebAssets.Config = (function() {

  function Config(url) {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        var status = xhr.status;
        if (status === 200) {
          var data = xhr.responseText;

          try {
            data = JSON.parse(data);
            var key;
            for (key in data) {
              if (data.hasOwnProperty(key)) {
                self[key] = data[key];
              }
            }
            self.onsuccess();
          } catch (e) {
            if (self.onerror)
              self.onerror(new Error(
                'Could not parse json for asset file'
              ));
          }

        } else {
          if (self.onerror)
            self.onerror(new Error(
              'Could not fetch asset file at "' + url + '"'
            ));
        }
      }
    }

    xhr.send(null);
  }

  return Config;

}());
WebAssets.Loader = (function() {

  /**
   * Web Asset Loader
   */
  function Loader(document) {
    if (typeof(document) === 'undefined') {
      document = window.document;
    }

    this.doc = document;
    this._cssAssets = [];
    this._jsAssets = [];
  }

  Loader.prototype = {

    /**
     * List of css assets to load.
     */
    _cssAssets: null,

    /**
     * List of js assets.
     */
    _jsAssets: null,

    /**
     * Called with all assets are successfully
     * loaded.
     */
    oncomplete: function() {},

    /**
     * Called when some error occurs when loading assets.
     */
    onerror: function() {},

    /**
     * Basic resource loading logic
     * for css & js.
     *
     * @param {HTMLElement} el link/script element.
     * @param {String} file source of asset.
     * @param {Function} cb node style callback.
     */
    _loadFile: function(el, file, cb) {
      el.onload = function() {
        cb(null);
      }

      el.onerror = function() {
        cb(new Error(
          'cannot load file "' + file + '"'
        ));
      }

      document.head.appendChild(el);
    },

    /**
     * Loads CSS File.
     *
     * @param {String} file asset source.
     * @param {Function} cb node style callback.
     */
    _loadCss: function(file, cb) {
      var el = document.createElement('link');
      el.href = file;

      el.setAttribute('rel', 'stylesheet');
      el.setAttribute('type', 'text/css');

      this._loadFile(el, file, cb);
    },

    /**
     * Loads JS File.
     *
     * @param {String} file asset source.
     * @param {Function} cb node style callback.
     */
    _loadJs: function(file, cb) {
      var el = document.createElement('script');
      el.src = file;

      el.setAttribute('type', 'text/javascript');

      this._loadFile(el, file, cb);
    },

    /**
     * Adds a css file to loader list.
     *
     * @param {String} item css item to load.
     * @return {Self} chainable.
     */
    css: function(item) {
      this._cssAssets.push(item);
      return this;
    },

    /**
     * Adds a js file to the loader list.
     *
     * @param {String} item js item to load.
     * @return {Self} chainable.
     */
    js: function(item) {
      this._jsAssets.push(item);
      return this;
    },

    load: function(cb) {
      var self = this;
      var pending = 0;

      pending += this._jsAssets.length;
      pending += this._cssAssets.length;

      function complete() {
        self.oncomplete();
        cb(null);
      }

      function next() {
        if (!(--pending)) {
          complete();
        }
      }

      function handleLoad(err) {
        if (err) {
          self.onerror(err);
        }
        next();
      }

      this._jsAssets.forEach(function(file) {
        this._loadJs(file, handleLoad);
      }, this);

      this._cssAssets.forEach(function(file) {
        this._loadCss(file, handleLoad);
      }, this);

    }

  };

  return Loader;

}());
WebAssets.DomQueue = (function() {

  return {
    state: document.readyState,
    _queue: [],

    init: function() {
      window.addEventListener(
        'DOMContentLoaded', this, false
      );
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



}());
