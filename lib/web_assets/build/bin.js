var program = require('../../commander');
var fsPath = require('path');
var pwd;

if (typeof(window) === 'undefined') {
  pwd = process.env.PWD;
} else {
  pwd = require('env').get('PWD');
}

pwd = fsPath.resolve(pwd);

program.
  command('install').
  description('builds an asset file').
  option('-f, --file', 'asset file name').
  action(function() {
    var root;

    if (typeof(program.args[0]) === 'string') {
      root = program.args[0];
    } else {
      root = pwd;
    }

    if (root[0] !== '/') {
      root = fsPath.resolve(pwd, root);
    }

    require('./index').run(
      root,
      fsPath.resolve(root, program.file || 'assets.json'),
      function() {
        if (typeof(window) !== 'undefined') {
          window.xpcEventLoop.stop();
        }
        console.log('BUILD COMPLETE');
      }
    );

    if (typeof(window) !== 'undefined') {
      window.xpcEventLoop.start();
    }
  });

program.parse(process.argv);
