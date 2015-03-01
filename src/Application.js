var Sounds = require('sounds');
var Commandor = require('commandor');
require('requestanimationframe');

var View = require('./View');
var ViewOptions = require('./ViewOptions');
var ViewGame = require('./ViewGame');
var ViewUpdate = require('./ViewUpdate');

// Application constructor
function Application(rootElement) {
	// Looking for a new version
	if(window.applicationCache) {
		window.applicationCache.addEventListener('updateready',function() {
			// asking player to update if he's not playing
			if(this.view instanceof ViewGame) {
				this.showView('Update');
			}
		}.bind(this));
	}
	// saving the rootElement ref
	this.rootElement = rootElement;
	// instanciating the command manager
	this.cmdMgr = new Commandor(rootElement);
	// Adding the changeView command
	this.cmdMgr.suscribe('changeView',
		this.changeView.bind(this));
	// instanciating the sound manager and adding sounds
	this.sounds = new Sounds('sounds');
	this.sounds.register('lazer',['ogg']);
	this.sounds.register('boing',['ogg']);
	this.sounds.register('boing2',['ogg']);
	this.sounds.register('gunshot',['ogg']);
	this.sounds.register('crash',['ogg']);
	this.sounds.register('badadum',['ogg']);
	this.sounds.register('fart',['ogg']);
	this.sounds.register('bleep',['ogg']);
	// getting the sound prefs
	try {
		if(window.localStorage&&window.localStorage.muted) {
			this.sounds.mute(!!window.localStorage.muted);
		}
	} catch(e) {}
	// saving the message element ref
	this.message=document.querySelector('div.app div.message p');
	// websocket attemps
	this.wsAttempts=0;
	// showing the main view
	this.showView('Home');
}

// Messages management
Application.prototype.showMessage = function (text,duration,callback) {
	if(this.messageTimeout) {
		clearTimeout(this.messageTimeout);
	}
	this.messageTimeout=setTimeout(this.hideMessage.bind(this),duration||1500);
	this.messageCallback=callback;
	this.message.firstChild.textContent=text;
	this.message.parentNode.classList.add('show');
};

Application.prototype.hideMessage = function () {
	this.message.parentNode.classList.remove('show');
	this.messageTimeout=null;
	this.messageCallback&&this.messageCallback();
	this.messageCallback=null;
};

// Views management
Application.prototype.changeView = function (event,params) {
	this.showView(params.view);
};

Application.prototype.showView = function (name) {
	// uninitializing previous view
	if(this.displayedView) {
		this.displayedView.uninit();
	// Or hide initial loading view
	} else {
		document.getElementById('Loading').setAttribute('class','view');
	}
	// creating next view
	if('Update' === name) {
		this.displayedView = new ViewUpdate();
	} else if('Options' === name) {
		this.displayedView = new ViewOptions();
	} else if('Game' === name) {
		this.displayedView = new ViewGame();
	} else {
		this.displayedView = new View();
	}
	this.displayedView.init(this, name);
};

// launching the app
new Application(document.querySelector('div.app'));

