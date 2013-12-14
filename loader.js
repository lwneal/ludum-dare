var Assets = (function(){
  var init = function() {
    this.assets = {};
    this.callback = null;
    this.num_to_load = 0;
  };

  var get = function(name) {
    return this.assets[name];
  };

  var asset = function(name, cb) {
    this.num_to_load += 1;
    console.log("Need to load " + this.num_to_load + " assets");

    self = this;
    return function(loaded_data) {
      self.assets[name] = loaded_data;
      self.num_to_load -= 1;

      if (cb) cb(loaded_data);

      if (self.num_to_load == 0) {
        self.callback(self);
      }
    }
  };

  return {
    "init": init,
    "get": get,
    "asset": asset
  };
})();
