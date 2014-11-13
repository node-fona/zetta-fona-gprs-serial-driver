var Device = require('zetta-device');
var util = require('util');

var FonaGPRS = module.exports = function() {
  Device.call(this);
  this._serialDevice = arguments[0];
  this._apn = arguments[1];

  this.triangulationMysteryParam = null;
  this.triangulationLongitude = null;
  this.triangulationLatitude = null;
  this.triangulationDate = null;
  this.triangulationTime = null
};
util.inherits(FonaGPRS, Device);

FonaGPRS.prototype.init = function(config) {

  config
  .name('Adafruit Fona GPRS')
  .type('fona-gprs')
  .state('waiting')
  .when('waiting', { allow: ['get-location']})
  .map('get-location', this.getLocation);

};
FonaGPRS.prototype.getLocation = function(cb) {
  this.log('getLocation');

  var self = this;

  // set bearer profile
  var command = 'AT+SAPBR=3,1,"CONTYPE","GPRS"';
  var tasks = [
  {
    before: function() {self.state = 'getting-location'},
    command: command,
    regexp: /^$/
  },
  {
    regexp: /OK/
  }
  ];
  this._serialDevice.enqueue(tasks);

  // set APN
  command = 'AT+SAPBR=3,1,"APN","' + this._apn + '"';
  tasks = [
  {
    command: command,
    regexp: /^$/
  },
  {
    regexp: /OK/
  }
  ];
  this._serialDevice.enqueue(tasks);

  command = 'AT+SAPBR=1,1';
  tasks = [
  {
    command: command,
    regexp: /^$/
  },
  {
    regexp: /OK|ERROR/
  }
  ];
  this._serialDevice.enqueue(tasks);

  command = 'AT+CIPGSMLOC=1,1';
  tasks = [
  {
    command: command,
    regexp: /^$/
  },
  {
    regexp: /^\+CIPGSMLOC: (\d+),([0-9\-\.]+),([0-9\-\.]+),([0-9/]+),([0-9:]+)$/,
    onMatch: function(match) {
      self.triangulationMysteryParam = match[1];
      self.triangulationLongitude = match[2];
      self.triangulationLatitude = match[3];
      self.triangulationDate = match[4];
      self.triangulationTime = match[5]
    }
  },{
    regexp: /^$/
  },{
    regexp: /OK/,
    onMatch: function() {
      self.state = 'waiting';
      cb();
    }
  }
  ];
  this._serialDevice.enqueue(tasks);
};