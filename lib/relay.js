var gpio = require('./gpio');
var config = require('../config/config');

var pin = config.relay.pin;

module.exports = new RelayInstance();

function RelayInstance() {
	var gpioPin;
	var timer = null;
	var self = this;

	function init() {
		gpioPin = new gpio.In(pin);
		self.off();
	}
	
	this.on = function() {
		gpioPin.low(); // Relays are weird, they go high when you set the pin low.
	};
	
	this.off = function() {
		gpioPin.high(); // Relays are weird, they go high when you set the pin low.
	};
	
	this.close = function() {
		gpioPin.close();
	};
	
	this.onFor = function(seconds) {
		if (timer) {
			clearTimeout(timer);
		}
		self.on();
		timer = setTimeout(function() {
			self.off();
			timer = null;
		}, seconds * 1000);
	};
	
	init();
}