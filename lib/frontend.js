function FrontendInstance() {
	var express = require('express');
	var path = require('path');
	var http = require('http');

	var app;
	var io;
	
	var users = [];

	function init() {
		initServer();
	}
	
	function initServer() {
		app = express();
		var server = http.Server(app);
		io = require('socket.io')(server);
		
		app.get('/', function (req, res) {
			res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
		});
		
		app.use(express.static(path.join(__dirname, '../frontend/public')));

		server.listen(8080, function(){
			console.log('listening on *:8080');
		});

		io.on('connection', function(socket){
			socket.emit('initialUsers', users);
		});
	}
	
	this.setUsers = function(_users) {
		users = _users;
	};
	
	this.userConnected = function(user) {
		users.push(user);
		io.emit('userConnected', user);
	};
	
	this.userDisconnected = function(user) {
		remove(user);
		io.emit('userDisconnected', user);
	};
	
	function remove(user) {
		var i = find(user);
		if (i >= 0) {
			users.splice(i, 1);
		}
	}
	
	function find(user) {
		for (var i = 0; i < users.length; i++) {
			if (users[i].name === user.name) {
				return i;
			}
		}
		return -1;
	}
	
	init();
}

module.exports = new FrontendInstance();