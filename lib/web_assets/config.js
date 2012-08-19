WebAssets.Config = (function() {

  function Config(url) {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        var status = xhr.status;
        if (status === 200) {
          var data = xhr.responseText;

          try {
            data = JSON.parse(data);
            var key;
            for (key in data) {
              if (data.hasOwnProperty(key)) {
                self[key] = data[key];
              }
            }
            self.onsuccess();
          } catch (e) {
            if (self.onerror)
              self.onerror(new Error(
                'Could not parse json for asset file'
              ));
          }

        } else {
          if (self.onerror)
            self.onerror(new Error(
              'Could not fetch asset file at "' + url + '"'
            ));
        }
      }
    }

    xhr.send(null);
  }

  return Config;

}());
