var CSS = require('./css');
var JS = require('./js');

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

  var css = new CSS(build);
  var js = new JS(build);

  css.process(function() {
    next();
  });

  js.process(function() {
    next();
  });
};

module.exports = Build;
