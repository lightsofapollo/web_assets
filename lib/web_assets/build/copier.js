if (typeof(Components) === 'undefined') {
  //XXX: Implement
  module.exports = require('./node_copier');
} else {
  module.exports = require('./xpc_copier');
}
