var fsPath = require('path');
var fs = require('fs');

function Asset(build, cb) {
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

  outputJoin: '\n',

  assetOptions: function(asset) {
    if (typeof(asset) === 'string') {
      return { src: asset };
    }

    return asset;
  },

  banner: function() {
    var name = this.inputProperty;
    var out = '/*\n' +
               '* web asset generated ' + name + ' file.\n' +
               '* Do not directly the contents\n' +
               '*/\n';

    return out;
  },

  readAssetSrc: function(src, cb) {
    var path = src;
    // prepare path
    if (src.indexOf('http') !== 0) {
      // local file
      if (src[0] !== '/') {
        src = fsPath.resolve(this.build.root, src);
      }
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

    try {
      xhr.send(null);
    } catch (e) {
      console.log(
        'Error while loading asset "' + src + '"'
      );
    }
  },

  postProcessAsset: function(data, asset, cb) {
    cb(null, data);
  },

  process: function(cb) {
    var self = this;
    var assetList = this.assets[this.inputProperty];
    var pending = assetList.length;
    var outfile = this.assets[this.outputProperty];

    outfile = fsPath.resolve(
      this.build.root,
      outfile
    );

    var slots = [];

    if (!outfile) {
      throw new Error(
        'must provide a "' + this.outputProperty + '" to asset file'
      );
    }

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
      var content = self.banner();
      content += slots.join(self.outputJoin);

      fs.writeFileSync(
        outfile, content
      );

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

module.exports = Asset;
