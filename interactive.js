var relay = require('./lib/relay');

var sys = require("sys");

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
	// note:  d is an object, and when converted to a string it will
	// end with a linefeed.  so we (rather crudely) account for that  
	// with toString() and then substring() 
	var val = d.toString().substring(0, d.length-1);
	
	if (val === 'on') {
		relay.on();
	} else if (val === 'off') {
		relay.off();
	} else if (val === 'close') {
		relay.close();
	}
});