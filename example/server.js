var zetta = require('zetta');
var SerialDevice = require('zetta-serial-device-driver');
var FonaGPRS = require('../index');

zetta()
  .use(SerialDevice, '/dev/cu.usbserial')
  .use(FonaGPRS, 'epc.tmobile.com')
  .listen(1337);
