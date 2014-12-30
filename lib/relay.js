var gpio = require('./gpio');
var config = require('../config/config');

var pin = config.relay.pin;

module.exports = new RelayInstance();

function RelayInstance() {
	var gpioPin;
	var timer = null;

	function init() {
		gpioPin = new gpio.In(pin);
		off();
	}
	
	this.on = function on() {
		gpioPin.low(); // Relays are weird, they go high when you set the pin low.
	};
	
	this.off = function off() {
		gpioPin.high(); // Relays are weird, they go high when you set the pin low.
	};
	
	this.close = function() {
		gpioPin.close();
	};
	
	this.onFor = function(seconds) {
		if (timer) {
			clearTimeout(timer);
		}
		on();
		timer = setTimeout(function() {
			off();
			timer = null;
		}, seconds * 1000);
	};
	
	init();
}