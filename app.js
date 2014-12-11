var userManager = require('./lib/user-manager');

userManager.on('userConnected', function(user) {
	console.log("User connected", user);
});
userManager.on('userDisconnected', function(user) {
	console.log("User disconnected", user);
});

var frontend = require('./lib/frontend')(userManager);