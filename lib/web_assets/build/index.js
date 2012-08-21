//var css = require('./css');
//var js = require('./js');

function Build(root, assets) {
  this.root = root;
  this.assets = assets;
}

Build.run = function(root, assetFile, callback) {
  var build = new Build(root, require(assetFile));
  var pending = 2;

  function next() {
    if (!(--pending)) {
      callback();
    }
  }

  css.process(build, function() {
    next();
  });

  js.process(build, function() {
    next();
  });
};

module.exports = Build;
