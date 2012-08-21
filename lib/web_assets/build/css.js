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
    copier.copy(details.from, targetPath, callback);
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

      var source;
      var dest = src;

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
