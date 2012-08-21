var Asset = require('./asset');

function CSS() {
  Asset.apply(this, arguments);
}

CSS.prototype = {
  __proto__: Asset.prototype,

  inputProperty: 'css',
  outputProperty: 'cssTarget'
};

module.exports = CSS;
