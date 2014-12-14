$(function() {
	var WELCOME_TIMEOUT = 10000;
	
	var socket = io();
	var users = [];
	var pendingUser = null;
	
	var templates = {};
	var dom = {};
	var timers = {};

	var weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	function init() {
		initDom();
		initListeners();
		displayClock();
	}
	
	function initDom() {
		dom.title = $('#title');
		dom.list = $('#list');
		dom.list.empty = dom.list.find('.js-empty');
		templates.listEntry = dom.list.find('.js-template');
		templates.listEntry.removeClass('js-template');
		templates.listEntry.remove();
	}
	
	function initListeners() {
		socket.on('initialUsers', function(users) {
			console.log(users);
			setUsers(users);
		});
		socket.on('userConnected', function(user) {
			users.push(user);
			addListEntry(user);
			
			displayUsers(user);
			stopClock();
			dom.title.text('Welcome home, ' + user.name);
			if (timers.welcome) {
				clearTimeout(timers.welcome);
			}
			pendingUser = user;
			timers.welcome = setTimeout(function() {
				displayUsers();
				displayClock();
				timers.welcome = null;
				pendingUser = null;
			}, WELCOME_TIMEOUT);
		});
		socket.on('userDisconnected', function(user) {
			var i = find(user);
			if (i >= 0) {
				users.splice(i, 1);
			}
			if (timers.welcome && pendingUser && pendingUser.name === user.name) {
				clearTimeout(timers.welcome);
				displayClock();
			} else {
				removeListEntry(user);
			}
		});
	}
	
	function displayClock() {
		stopClock();
		function setTime() {
			var d = new Date();
			dom.title.text(
					weekdays[d.getDay()] + ', ' +
					pad(d.getDate()) + ' ' +
					months[d.getMonth()] + ' ' +
					pad(d.getHours()) + ':' + pad(d.getMinutes()));
		}
		setTime();
		timers.clock = setInterval(setTime, 500);
	}
	
	function stopClock() {
		if (timers.clock) {
			clearInterval(timers.clock);
			timers.clock = null;
		}
		dom.title.text('');
	}
	
	function pad(i) {
		return i < 10 ? '0' + i : '' + i;
	}
	
	function addListEntry(user) {
		var entry = templates.listEntry.clone();
		entry.find('.js-name').text(user.name);
		entry.find('.js-time').text(roundTime(user.since)); // TODO "all day"
		entry.data('name', user.name);
		dom.list.empty.hide();
		dom.list.append(entry);
	}
	
	function roundTime(time) {
		time = new Date(time);
		var h = time.getHours();
		var m = time.getMinutes();
		m = 5 * Math.round(m / 5);
		if (m === 60) {
			m = 0;
			h++;
		}
		return pad(h) + ':' + pad(m);
	}
	
	function removeListEntry(user) {
		dom.list.children().each(function() {
			if ($(this).data('name') === user.name) {
				$(this).remove();
				return false;
			}
		});
	}
	
	function clearList() {
		dom.list.children().not(dom.list.empty).remove();
		dom.list.empty.show();
	}
	
	function setUsers(newUsers) {
		users = [].concat(newUsers);
		
		displayUsers();
	}
	
	function displayUsers(except) {
		clearList();
		console.log("Users:", users);
		$.each(users, function() {
			if (!except || except.name !== this.name) {
				addListEntry(this);
			}
		});
	}
	
	function find(user) {
		for (var i = 0; i < users.length; i++) {
			if (user.name === users[i].name) {
				return i;
			}
		}
		return -1;
	}
	
	function isHome(user) {
		return find(user) >= 0;
	}
	
	init();
});