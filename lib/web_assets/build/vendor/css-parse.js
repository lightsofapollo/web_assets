/*
(The MIT License)

Copyright (c) 2012 TJ Holowaychuk <tj@vision-media.ca>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Module dependencies.
 */

var debug = require('debug')('css-parse');
var EXTRA_WHITESPACE = /(\s{2,})+/;

module.exports = function(css) {

  /**
   * Parse stylesheet.
   */

  function stylesheet() {
    return { stylesheet: { rules: rules() }};
  }

  /**
   * Opening brace.
   */

  function open() {
    return match(/^{\s*/);
  }

  /**
   * Closing brace.
   */

  function close() {
    return match(/^}\s*/);
  }

  /**
   * Parse ruleset.
   */

  function rules() {
    var node;
    var rules = [];
    whitespace();
    comments();
    while (css[0] != '}' && (node = atrule() || rule())) {
      comments();
      rules.push(node);
    }
    return rules;
  }

  /**
   * Match `re` and return captures.
   */

  function match(re) {
    var m = re.exec(css);
    if (!m) return;
    css = css.slice(m[0].length);
    return m;
  }

  /**
   * Parse whitespace.
   */

  function whitespace() {
    match(/^\s*/);
  }

  /**
   * Parse comments;
   */

  function comments() {
    while (comment()) ;
  }

  /**
   * Parse comment.
   */

  function comment() {
    if ('/' == css[0] && '*' == css[1]) {
      var i = 2;
      while ('*' != css[i] && '/' != css[i + 1]) ++i;
      i += 2;
      css = css.slice(i);
      whitespace();
      return true;
    }
  }

  function cleanSelector(item) {
    item = item.replace(EXTRA_WHITESPACE, ' ');
    return item;
  }

  /**
   * Parse selector.
   */

  function selector() {
    var m = match(/^([^{]+)/);
    if (!m) return;
    var result = m[0].trim().split(/\s*,\s*/);
    if (result) {
      result = result.map(cleanSelector)
    }
    return result;
  }

  /**
   * Parse declaration.
   */

  function declaration() {
    // prop
    var prop = match(/^([-\w]+)\s*/);
    if (!prop) return;
    prop = prop[0];

    // :
    if (!match(/^:\s*/)) return;

    // val
    var val = match(/^([^};]+)\s*/);
    if (!val) return;
    val = val[0].trim();

    // ;
    match(/^;\s*/);

    return { property: prop, value: val };
  }

  /**
   * Parse keyframe.
   */

  function keyframe() {
    var m;
    var vals = [];

    while (m = match(/^(from|to|\d+%)\s*/)) {
      vals.push(m[1]);
      match(/^,\s*/);
    }

    if (!vals.length) return;

    return {
      values: vals,
      declarations: declarations()
    };
  }

  /**
   * Parse keyframes.
   */

  function keyframes() {
    var m = match(/^@([-\w]+)?keyframes */);
    if (!m) return;
    var vendor = m[1];

    // identifier
    var m = match(/^([-\w]+)\s+/);
    if (!m) return;
    var name = m[1];

    if (!open()) return;
    comments();

    var frame;
    var frames = [];
    while (frame = keyframe()) {
      frames.push(frame);
      comments();
    }

    if (!close()) return;

    return {
      name: name,
      vendor: vendor,
      keyframes: frames
    };
  }

  /**
   * Parse media.
   */

  function media() {
    var m = match(/^@media *([^{]+)/);
    if (!m) return;
    var media = m[1].trim();

    if (!open()) return;
    comments();

    var style = rules();

    if (!close()) return;

    return { media: media, rules: style };
  }

  /**
   * Parse import
   */

  function atimport() {
    var m = match(/^@import *([^;\n]+);\s*/);
    if (!m) return;
    return { import: m[1].trim() };
  }

  /**
   * Parse declarations.
   */

  function declarations() {
    var decls = [];

    if (!open()) return;
    comments();
  
    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      comments();
    }
  
    if (!close()) return;
    return decls;
  }

  /**
   * Parse at rule.
   */
   
  function atrule() {
    return keyframes()
      || media()
      || atimport();
  }

  /**
   * Parse rule.
   */
  
  function rule() {
    var sel = selector();
    if (!sel) return;
    comments();
    return { selectors: sel, declarations: declarations() };
  }
  
  return stylesheet();
};
