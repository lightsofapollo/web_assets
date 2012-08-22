var fsPath = require('path');

Components.utils.import(
  'resource://gre/modules/NetUtil.jsm'
);

module.exports = {

  /**
   * Copies the contents of source
   * to target. Overriding any existing
   * content.
   *
   * @param {String} source uri of source.
   * @param {String} target uri of target.
   * @param {Function} callback node style callaback, err first.
   */
  copy: function(source, target, callback) {
    var file = Components.classes['@mozilla.org/file/local;1'].
      createInstance(Components.interfaces.nsILocalFile);

    file.initWithPath(fsPath.resolve(target));

    if (source[0] === '/') {
      source = 'file://' + source;
    }

    var sourceUri = NetUtil.newURI(source);
    var outputStream = Cc['@mozilla.org/network/file-output-stream;1'].
                  createInstance(Ci.nsIFileOutputStream);

    outputStream.init(file, -1, -1, 0);

    NetUtil.asyncFetch(sourceUri, function(input, result) {
      // Check that we had success.
      if (!Components.isSuccessCode(result)) {
        callback(new Error(
          'Failed to open input stream for: "' +
          target +
          '"'
        ));

        return;
      }

      NetUtil.asyncCopy(input, outputStream, function(innerResult) {
        if (!Components.isSuccessCode(innerResult)) {
          callback(new Error(
            'Failed to copy input stream to output "' +
            source +
            '"'
          ));
          return;
        } else {
          callback(null);
        }
      });
    });
  }
};
