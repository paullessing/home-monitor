var PIN = 7;

var gpio = require('pi-gpio');

var open = false;
var state = 0;
var pendingState = null;

gpio.open(PIN, 'out', function() {
	console.log("Opened pin", PIN);
	pendingState = pendingState || 1;
	console.log("Writing for state", pendingState);
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
		console.log('Wrote 1');
		state = 1;
	});
}

function low() {
	if (!open) {
		pendingState = 0;
		return;
	}
	gpio.write(PIN, 0, function() {
		console.log('Wrote 0');
		state = 0;
	});
}

function close() {
	if (open) {
		open = false;
		gpio.close(PIN);
		console.log("Closed", PIN);
	}
}

exports.on = low;
exports.off = high;
exports.close = close;