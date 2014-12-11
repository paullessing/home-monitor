var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

module.exports = function(userManager) {
	app.get('/', function (req, res) {
		res.sendFile(path.join(__dirname, 'html/index.html'));
	});

	app.use(express.static(path.join(__dirname, 'public')));

	io.on('connection', function(socket){
		var users = userManager.getUsersHome();
		io.emit('initialUsers', users);
	});

	userManager.on('userConnected', function(user) {
		io.emit('userConnected', user);
	});
	userManager.on('userDisconnected', function(user) {
		io.emit('userDisconnected', user);
	});

	http.listen(8080, function(){
		console.log('listening on *:8080');
	});
};