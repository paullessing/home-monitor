var config = require('./config/config');

var userManager = require('./lib/user-manager');

var frontend = require('./lib/frontend');
frontend.setUsers(userManager.getUsersHome());

var relay = require('./lib/relay');
var status = false;

userManager.on('userConnected', function(user) {
//	console.log("User connected", user);
	frontend.userConnected(user);
	relay.onFor(config.relay.onDurationSeconds);
});

userManager.on('userDisconnected', function(user) {
//	console.log("User disconnected", user);
	frontend.userDisconnected(user);
});