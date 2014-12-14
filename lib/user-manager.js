/**
 * Queries the Router for currently active MAC addresses and emits events when people turn up.
 */
var EventEmitter = require('events').EventEmitter,
    extend       = require('extend'),
    util         = require('util'),
    _            = require('underscore'),
    macRouter    = require('./mac-router');

var without = _.without,
	isEqual = _.isEqual,
	isEmpty = _.isEmpty;

util.inherits(UserManagerInstance, EventEmitter);
module.exports = new UserManagerInstance();

function UserManagerInstance() {
	var self = this;
	
	var usersHome = {};
	
	function init() {
		macRouter.on('users', processChanges);
	}
	
	function processChanges(users) {
		var now = new Date();
		var changes = {
				devicesConnected: [],
				devicesDisconnected: [],
				newUsers: [],
				lostUsers: []
		};
		var changed = getChangedUsers(users);
		
		for (name in changed) {
			var changedUser = changed[name];
			if (usersHome[name] && users[name]) {
				getDeviceChanges(changedUser, changes);
				usersHome[name].devices = changedUser.devices;
			} else if (users[name]) {
				// User is new here
				users[name].since = new Date(now.getTime() - changedUser.uptime) || now;
				changes.newUsers.push(users[name]);
				usersHome[name] = changedUser;
			} else {
				// User is gone
				changes.lostUsers.push(changedUser);
				delete usersHome[name];
			}
		}
		
		notifyChanges(changes);
	}
	
	function notifyChanges(changes) {
		_.each(changes.newUsers, function(user) {
			self.emit('userConnected', user);
		});
		_.each(changes.lostUsers, function(user) {
			self.emit('userDisconnected', user);
		});
		_.each(changes.devicesConnected, function(devices) {
			self.emit('devicesConnected', devices);
		});
		_.each(changes.devicesDisconnected, function(devices) {
			self.emit('devicesDisconnected', devices);
		});
	}
	
	function getChangedUsers(newUsers) {
		var tmp = extend({}, usersHome);
		var changed = {};
		
		for (name in newUsers) {
			if (!tmp[name]) {
				changed[name] = newUsers[name];
			} else {
				// user exists
				var newUser = newUsers[name];
				var user = tmp[name];
				if (!isEqual(newUser, user)) {
					changed[name] = user;
					delete tmp[name];
				}
			}
		}
		
		extend(changed, tmp); // Add all users that were there a moment ago
		
		if (isEmpty(changed)) {
			return false;
		}
		
		return changed;
	}
	
	function getDeviceChanges(changedUser, changes) {
		var name = changedUser.name;
		var user = usersHome[name];
		var oldDevices = user.activeDevices;
		var currentDevices = changedUser.activeDevices;
		if (!isEqual(currentDevices, oldDevices)) {
			var devicesConnected = without(currentDevices, oldDevices);
			var devicesDisconnected = without(oldDevices, currentDevices);
			
			if (!isEmpty(devicesConnected)) {
				changes.devicesConnected.push({
					name: name,
					devices: devicesConnected
				});
			}
			if (!isEmpty(devicesDisconnected)) {
				changes.devicesDisconnected.push({
					name: name,
					devices: devicesDisconnected
				});
			}
		}
	}
	
	this.getUsersHome = function() {
		var users = [];
		_.each(usersHome, function(user) {
			users.push(extend(true, {}, user));
		});
		return users;
	};
	
	init();
}