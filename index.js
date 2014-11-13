var Scout = require('zetta-scout');
var util = require('util');
var FonaGPRS = require('./fona_gprs');

var FonaGPRSScout = module.exports = function() {
  Scout.call(this);
  this.apn = arguments[0];
};
util.inherits(FonaGPRSScout, Scout);

FonaGPRSScout.prototype.init = function(next) {
  var FonaGPRSQuery = this.server.where({type: 'fona-gprs'});
  var serialDeviceQuery = this.server.where({ type: 'serial' });
  
  var self = this;

  this.server.observe(serialDeviceQuery, function(serialDevice) {
    self.server.find(FonaGPRSQuery, function(err, results) {
      if (results[0]) {
        self.provision(results[0], FonaGPRS, serialDevice, self.apn);
      } else {
        self.discover(FonaGPRS, serialDevice, self.apn);
      }
      next();
    });
  });
}
