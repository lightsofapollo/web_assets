var Asset = require('./asset');

function JS() {
  Asset.apply(this, arguments);
}

JS.prototype = {
  __proto__: Asset.prototype,

  inputProperty: 'js',
  outputProperty: 'jsTarget',
  outputJoin: '\n;'
};

module.exports = JS;

