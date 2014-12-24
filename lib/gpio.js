var gpio = require('pi-gpio');

module.exports = GpioPin;

function GpioPin(pinId, direction) {
	/**
	 * Whether the pin is open for writing.
	 */
	var open = false;
	/**
	 * Last known state of the pin.
	 */
	var state = null; // Floating
	/**
	 * If a write to the pin happens before the pin has been opened,
	 * we will write the values when it opens.
	 */
	var pendingState = null;
	
	function init() {
		gpio.open(pin, direction, function(err) {
			if (err) {
				console.log("Failed to open GPIO pin " + pin + ":", err);
				return;
			}
			if (!pendingState) {
				pendingState = [0];
			}
			recurPending();
		});
	}

	function recurPending() {
		if (pendingState) {
			var newState = pendingState.shift();
			write(newState, recurPending);
		} else {
			pendingState = null;
			open = true;
		}
	}
	
	function pushPending(value) {
		var binaryVal = value ? 1 : 0;
		if (!pendingState ||
				pendingState[pendingState.length - 1] !== binaryVal) {
			pendingState = pendingState || [];
			pendingState.push(binaryVal);
		}
	}
	
	this.high = function high(callback) {
		writeIfOpen(1, callback);
	}

	this.low = function low(callback) {
		writeIfOpen(0, callback);
	}
	
	function writeIfOpen(value, callback) {
		if (!open) {
			pushPending(value);
			return;
		}
		write(value, callback);
	}
	
	function write(value, callback) {
		if (value === state) {
			return; // Pointless
		}
		gpio.write(pin, value, function(err) {
			console.log('Wrote ' + value); // TODO remove debug
			state = value;
			if (typeof callback === 'function') {
				callback(err);	
			}
		});
	}

	this.close = function close() {
		if (open) {
			open = false;
			gpio.close(pin);
			console.log("Closed", pin); // TODO remove debug
		}
	}
	
	init();
}

GpioPin.In = function(pinId) {
	return new GpioPin(pinId, 'in');
}

GpioPin.Out = function(pinId) {
	return new GpioPin(pinId, 'out');
}