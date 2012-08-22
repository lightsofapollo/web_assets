var fsPath = require('path');
var copier = require('./copier');
var mkdirp = require('mkdirp');
var Asset = require('./asset');
const URL_PTN = /url\(([^\)]+)\)/g;

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
      callback(err);
    });
  },

  postProcessAsset: function(data, asset, callback) {
    var base = fsPath.dirname(asset.src);

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
      if (src.indexOf('data:') === 0)
        return match;

      var source;
      var dest = src;

      // XXX:  NetUtil.newURI could also be used
      // for parsing and probably should in the future...
      if (root.indexOf('http') === 0) {
        if (src.indexOf('http') !== 0) {
          src = fsPath.join('/', src);
          src = root + src;
        }
      } else {

        if (src.indexOf('http') !== 0 &&
            src[0] !== '/') {

          src = fsPath.join(root, src);
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
