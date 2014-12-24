var gpio = require('./gpio');
var config = require('../config/config');

var pin = config.relay_pin;

module.exports = new RelayInstance();

function RelayInstance() {
	var gpioPin = new gpio.In(pin);

	this.on = function() {
		gpioPin.low(); // Relays are weird, they go high when you set the pin low.
	};
	
	this.off = function() {
		gpioPin.high(); // Relays are weird, they go high when you set the pin low.
	};
	
	this.close = function() {
		gpioPin.close();
	}
}