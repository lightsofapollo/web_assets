var fsPath = require('path');
var fs = require('fs');

function Asset(build) {
  this.build = build;
  this.assets = this.build.assets;
}

Asset.prototype = {

  /**
   * For override by children assets.
   * This is the property used to lookup
   * the asset input property. This property
   * is expected to be an array which
   * either contains a string or an object with
   * a src property.
   */
  inputProperty: null,

  /**
   * For override by children assets.
   * This is the property used to lookup
   * the final file which will output
   * the joined/processed results...
   */
  outputProperty: null,

  assetOptions: function(asset) {
    if (typeof(asset) === 'string') {
      return { src: asset };
    }

    return asset;
  },

  readAssetSrc: function(src, cb) {
    var path = src;
    // prepare path
    if (src.indexOf('http') !== 0) {
      // local file
      path = 'file://' + fsPath.resolve(src);
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          cb(null, xhr.responseText);
        } else {
          cb(new Error(
            'asset: "' + src + '" could not be loaded ' +
            'status: "' + xhr.status + '"'
          ));
        }
      }
    }

    xhr.send(null);
  },

  postProcessAsset: function(data, asset, cb) {
    cb(null, data);
  },

  process: function(cb) {
    var self = this;
    var assetList = this.assets[this.inputProperty];
    var pending = assetList.length;
    var outfile = this.assets[this.outputProperty];

    var slots = [];

    if (!outfile) {
      throw new Error('must provide .cssTarget to asset file');
    }

    outfile = fsPath.resolve(this.build.root, outfile);

    if (!pending) {
      return cb(null);
    }

    function next(data, index) {
      slots[index] = data;
      if (!(--pending)) {
        complete();
      }
    }

    function complete() {
      fs.writeFileSync(outfile, slots.join('\n'));
      cb(null);
    }

    assetList.forEach(function(item, idx) {
      var asset = this.assetOptions(item);
      this.readAssetSrc(asset.src, function(err, item) {
        // XXX: warn when error
        var data = item || '';
        self.postProcessAsset(data, asset, function(postErr, final) {
          next(final, idx);
        });
      });
    }, this);
  }

};

Asset.process = function(build, cb) {
  return (new Asset(build)).process(cb);
};

module.exports = Asset;
