/**
 * Queries the Router for currently active MAC addresses and emits events whenever a result is available.
 * 
 * Emits events with name "users" with the following signature:
 * 	{
 * 		"{user-name}": {
 *   			name: String,
 *   			devices: [
 *   				"{device-name}": "{mac-address}"
 *   			],
 *   			activeDevices: String[] (of macs),
 *   			uptime: long (in ms)
 *  		}
 *  	}
 *  }
 */
var EventEmitter = require('events').EventEmitter,
    extend       = require('extend'),
    util         = require('util'),
    http         = require('http'),
    bl           = require('bl'),
    macs         = require('./mac-addresses'),
    config       = require('../config/router-config.json');

if (config.mock) {
	util.inherits(MockRouterInstance, EventEmitter);
	module.exports = new MockRouterInstance();
} else {
	util.inherits(MacRouterInstance, EventEmitter);
	module.exports = new MacRouterInstance();
}

function MacRouterInstance() {
	var httpOptions = config.http;
	var wirelessLine = /\{active_wireless::(.*?)\}/i;
	var self = this;
	var requestRunning = false;
	
	function handleResponse(data) {
		var usersHome = getUsersAtHome(data);
		self.emit('users', usersHome);
	}
	
	function getUsersAtHome(data) {
		var usersHome = {};
		
		var lines = data.split("\n");
		for (var i = 0; i < lines.length; i++) {
			var match = wirelessLine.exec(lines[i]);
			if (!match) {
				continue;
			}
			var devices = parseForDevices(match[1]);
			for (var j = 0; j < devices.length; j++) {
				var device = devices[j];
				var user = macs.find(device.mac);
				if (user) {
					var userData = usersHome[user.name] || (usersHome[user.name] = extend({}, user));
					extend(userData, { activeDevices: [] });
					userData.activeDevices.push(device.mac.toUpperCase());
					userData.activeDevices.sort();
					userData.uptime = Math.max(userData.uptime || 0, device.uptime);
				}
			}
		}
		return usersHome;
	}
	
	function parseForDevices(line) {
		var blocks = line.split("','");
		for (var i = 0; i < blocks.length; i++) {
			blocks[i] = blocks[i].replace(/(^'|'$)/g,'');
		}
		var devices = [];
		for (var i = 0; i < blocks.length; i += 9) {
			var block = blocks.slice(i, i + 9);
			devices.push({
				mac: block[0],
				iface: block[1], // eth1 or eth2
				uptime: parseDate(block[2]), // (DD days, )HH:MM:SS
				tx: block[3], // 1M to 54M
				rx: block[4], // 6M to 72M
				signal: block[5], // -47 to -76
				noise: block[6], // -79 to -89
				snr: block[7], // Signal-to-Noise (11-40)
				quality: block[8] // percentage points; divide by 10 to get percentage
			});
		}
		return devices;
	}
	
	function runRequest() {
		if (requestRunning) {
			return;
		}
		requestRunning = true;
		http.request(httpOptions, 
		function (response) {
			//	console.log('STATUS: ' + response.statusCode);
			//	console.log('HEADERS: ' + JSON.stringify(response.headers));
			response.pipe(bl(function(err, data) {
				handleResponse(data.toString());
				requestRunning = false;
				// TODO error handling
				//console.log("Response received:\n", data.toString());
			}));
		}).end();
	}
	
	function parseDate(dateStr) {
		var regex = /(?:(\d+) days, )?(\d+):(\d{2}):(\d{2})/gi;
		var matches = regex.exec(dateStr);
		if (!matches) {
			return false;
		}
		var time = matches[1] ? parseInt(matches[1], 10) : 0;
		time *= 24;
		time += parseInt(matches[2], 10);
		time *= 60;
		time += parseInt(matches[3], 10);
		time *= 60;
		time += parseInt(matches[4], 10);
		time *= 1000;
		return time;
	}
	
	setInterval(runRequest, 2000);
	runRequest();
}

function MockRouterInstance() {
	var self = this;
	setInterval(function() {
		self.emit('users', {
			Paul: {
				devices: {
					"Galaxy S4": '00000000000'
				},
				activeDevices: '00000000000',
				uptime: 3600000
			}
		});
	}, 2000);
}