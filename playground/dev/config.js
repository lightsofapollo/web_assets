(function(window) {
  var asset = new WebAssets('/playground/assets.json');
  var doc = document.documentElement;
  var start = Date.now();

  console.log('start loading...');
  doc.setAttribute('hidden', 'hidden');

  asset.oncomplete = function() {
    doc.removeAttribute('hidden');
    console.log('---shown', (Date.now() - start) + 'ms');
  }

}(this));
