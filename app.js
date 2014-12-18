var userManager = require('./lib/user-manager');

var frontend = require('./lib/frontend');
frontend.setUsers(userManager.getUsersHome());

var relay = require('./lib/relay');
relay.off();
var offTimer = null;
var status = false;

userManager.on('userConnected', function(user) {
//	console.log("User connected", user);
	frontend.userConnected(user);
	relay.on();
	if (offTimer) {
		clearTimeout(offTimer);
	}
	offTimer = setTimeout(function() {
		relay.off();
		offTimer = null;
	}, 15000); // TODO make configurable
	
});
userManager.on('userDisconnected', function(user) {
//	console.log("User disconnected", user);
	frontend.userDisconnected(user);
});