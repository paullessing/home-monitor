var config = require('../config/mac-config.json');

var _ = require('underscore');

var confByMac = {};
var confByName = {};

for (name in config) {
	var values = config[name];
	if (!values.devices) {
		values.devices = {};
	}
	if (!values.speech && values.speech !== false && values.speech !== '') {
		values.speech = name + " is home.";
	}
	var conf = {
		name: name,
		devices: _.map(values.devices, function(device) {
			return device.toUpperCase();
		}),
		speech: values.speech
	};
	confByName[name.toUpperCase()] = conf;
	var devices = conf.devices;
	for (device in devices) {
		if (devices.hasOwnProperty(device)) {
			confByMac[devices[device]] = conf;
		}
	}
}

exports.find = function(mac) {
	return confByMac[mac.toUpperCase()] || false;
};

exports.findByName = function(name) {
	return confByName[name.toUpperCase()] || false;
};