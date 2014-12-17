var PIN = 7; // TODO make this configurable.

var gpio = require('pi-gpio');

var open = false;
var state = 0;
var pendingState = null;

gpio.open(PIN, 'out', function() {
	console.log("Opened pin", PIN); // TODO remove debug
	pendingState = pendingState || 1;
	console.log("Writing for state", pendingState); // TODO remove debug
	gpio.write(PIN, pendingState, function() {
		state = pendingState;
		pendingState = null;
		open = true;
	});
});

function high() {
	if (!open) {
		pendingState = 1;
		return;
	}
	gpio.write(PIN, 1, function() {
		console.log('Wrote 1'); // TODO remove debug
		state = 1;
	});
}

function low() {
	if (!open) {
		pendingState = 0;
		return;
	}
	gpio.write(PIN, 0, function() {
		console.log('Wrote 0'); // TODO remove debug
		state = 0;
	});
}

function close() {
	if (open) {
		open = false;
		gpio.close(PIN);
		console.log("Closed", PIN); // TODO remove debug
	}
}

exports.on = low; // Relays are weird, they go high when you set the pin low.
exports.off = high;
exports.close = close;