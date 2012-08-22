var CSS = require('./vendor/css');
// http://www.w3.org/TR/CSS21/syndata.html#tokenization
var COMMENT = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gm;

/**
 * CSS Container.
 * Used to manipulate css files.
 *
 * @param {String} raw raw text css.
 */
function Container(raw) {
  this.raw = this._stripComments(raw);
  this.ast = CSS.parse(this.raw);
}

Container.prototype = {

  /**
   * Strips CSS comments using the w3c
   * comment spec.
   */
  _stripComments: function(raw) {
    return raw.replace(COMMENT, '');
  },

  /**
   * Iterates each item in the css ast
   * if the callback returns false removes
   * selector from the css ast.
   *
   * @param {Function} cb filter function.
   * @param {Object} context this value for fn.
   */
  filter: function(cb, context) {
    var list = this.ast.stylesheet.rules;
    var ruleOffset = 0;

    // shallow clone so we can remove
    // items from the main list
    list.concat([]).forEach(function(rule, ruleIdx) {
      var decl = rule.declarations;
      var selectors = rule.selectors;
      var removeIdx = [];

      // same deal here...
      var offset = 0;
      selectors.concat([]).forEach(function(name, idx) {
        var keep = cb.call(context, name, decl);

        if (!keep) {
          selectors.splice(idx - offset, 1);
          // we need to keep track of the
          // modified offset in the main array
          // for the in-place removals
          offset += 1;
        }
      });

      if (!selectors.length) {
        list.splice(ruleIdx - ruleOffset, 1);
        rule.selectors = [];
        rule.declarations = [];
        ruleOffset += 1;
      }
    });

  },

  /**
   * Filter out any selector not in list.
   *
   * @param {Array} list only include these selectors.
   */
  only: function(list) {
    list = (Array.isArray(list)) ? list : [list];

    this.filter(function(item) {
      return list.indexOf(item) !== -1;
    });
  },

  _grep: function(regex, positiveMatch) {
    if (typeof(positiveMatch) === 'undefined') {
      positiveMatch = true;
    }

    if (Array.isArray(regex)) {
      var i = 0;
      for (var i = 0; i < regex.length; i++) {
        this._grep(regex[i], positiveMatch);
      }
    } else {
      if (typeof(regex) === 'string') {
        regex = new RegExp(regex);
      }

      this.filter(function(item) {
        var result;
        if (positiveMatch) {
          result = regex.test(item);
        } else {
          result = !regex.test(item);
        }
        return result;
      });
    }
  },

  /**
   * Reverse of grep filter
   * out any pattern matching.
   *
   * @param {RegExp|Array|String} regex filter.
   */
  inverseGrep: function(regex) {
    this._grep(regex, false);
    return this;
  },

  /**
   * Filter out any selector not
   * matching the given regex.
   *
   * @param {RegExp|Array|String} regex filter.
   */
  grep: function(regex) {
    this._grep(regex, true);
    return this;
  },

  toString: function(opts) {
    return CSS.stringify(this.ast, opts);
  }

};

module.exports = Container;
