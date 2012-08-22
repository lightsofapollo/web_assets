var fsPath = require('path');
var copier = require('./copier');
var mkdirp = require('mkdirp');
var Asset = require('./asset');
var CSSContainer = require('./css_container')
const URL_PTN = /url\(([^\)]+)\)/g;

var debug = require('debug')('css:content');
var debugImage = require('debug')('css:image');

function CSS() {
  Asset.apply(this, arguments);
  this._imagesToCopy = [];
}

CSS.prototype = {
  __proto__: Asset.prototype,

  inputProperty: 'css',
  outputProperty: 'cssTarget',

  _copyImage: function(details, callback) {
    var buildTarget = this.assets[this.outputProperty];
    var targetPath = fsPath.resolve(
      this.build.root,
      fsPath.dirname(buildTarget),
      details.to
    );

    var dir = fsPath.dirname(targetPath);

    mkdirp.sync(dir, 0755);
    copier.copy(details.from, targetPath, function(err) {
      debugImage('Copied Asset', details.from, 'to', details.to);
      callback(err);
    });
  },

  _filterRules: function(data, asset) {
    if (!asset.grep && !asset.inverseGrep && !asset.only)
      return data;

    var container = new CSSContainer(data);

    if (asset.only) {
      debug(asset.src, 'only', asset.only);
      container.only(asset.only);
    }

    if (asset.grep) {
      debug(asset.src, 'grep', asset.grep);
      container.grep(asset.grep);
    }

    if (asset.inverseGrep) {
      debug(asset.src, 'inverseGrep', asset.inverseGrep);
      container.inverseGrep(asset.inverseGrep);
    }

    return container.toString();
  },

  postProcessAsset: function(data, asset, callback) {
    var base = fsPath.dirname(asset.src);
    data = this._filterRules(data, asset);

    data = this._processSourceForImages(
      base,
      data,
      asset.prefix || ''
    );

    // this is kind of a lame way to pass
    // images...
    var details = this._imagesToCopy;
    this._imagesToCopy = [];
    var pending = details.length;

    if (!pending) {
      callback(null, data);
      return;
    }

    function next() {
      if (!(--pending)) {
        callback(null, data);
      }
    }

    for (var i = 0; i < details.length; i++) {
      this._copyImage(details[i], next);
    }
  },

  _processSourceForImages: function(root, source, prefix) {
    var self = this;
    if (typeof(prefix) === 'undefined') {
      prefix = '';
    }

    // find images
    source = source.replace(URL_PTN, function(match, inner) {
      var first = inner[0];
      var src = inner;
      var result = match;

      if (first === '\'' || first === '"') {
        src = src.substr(1);
      }

      var last = src[src.length - 1];

      if (last === '\'' || last === '"') {
        src = src.substr(0, src.length - 1);
      }

      // skip data uri
      if (src.lastIndexOf('data:', 0) === 0)
        return match;

      var source;
      var dest = src;

      // XXX:  NetUtil.newURI could also be used
      // for parsing and probably should in the future...
      if (root.lastIndexOf('http', 0) === 0) {
        if (src.lastIndexOf('http', 0) !== 0) {
          src = fsPath.join('/', src);
          src = root + src;
        }
      } else {

        // handle on disk assets regardless of root
        if (src.lastIndexOf('http', 0) !== 0 &&
            src[0] !== '/') {

          src = fsPath.join(root, src);

          // if the resolved source is a inside
          // the same directory as the asset file
          // we don't need to copy assets because
          // they are already accessible. We just need
          // to modify the css output for images to poin
          // to an updated location....
          if (src[0] !== '/') {
            return 'url("' + src + '")';
          }
        }
      }

      if (prefix) {
        dest = fsPath.join(prefix, dest);
        result = 'url("' + dest + '")';
      }

      self._imagesToCopy.push({
        from: src,
        to: dest
      });

      return result;
    });

    return source;
  }

};

module.exports = CSS;
