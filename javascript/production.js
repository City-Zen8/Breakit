(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Commandor constructor : rootElement is the element
// from wich we capture commands
var Commandor=function Commandor(rootElement, prefix) {
	// event handlers
	var _pointerDownListener, _pointerUpListener, _pointerClickListener,
		_touchstartListener, _touchendListener, _clickListener,
		_keydownListener, _keyupListener,
		_formChangeListener, _formSubmitListener,
	// Commands hashmap
		_commands={'____internal':true}
	;
	// Command prefix
	this.prefix = prefix || 'app:';
	// Testing rootElement
	if(!rootElement) {
		throw Error('No rootElement given');
	}
	// keeping a reference to the rootElement
	this.rootElement=rootElement;
	// MS Pointer events : should unify pointers, but... read and see by yourself. 
	if(!!('onmsgesturechange' in window)) {
		// event listeners for buttons
		(function() {
			var curElement=null;
			_pointerDownListener=function(event) {
				curElement=this.findButton(event.target)||this.findForm(event.target);
				curElement&&event.preventDefault()||event.stopPropagation();
			}.bind(this);
			_pointerUpListener=function(event) {
				if(curElement) {
					if(curElement===this.findButton(event.target)) {
						this.captureButton(event);
					} else if(curElement===this.findForm(event.target)) {
						this.captureForm(event);
					}
					event.preventDefault(); event.stopPropagation();
					curElement=null;
				}
			}.bind(this);
			this.rootElement.addEventListener('MSPointerDown', _pointerDownListener, true);
			this.rootElement.addEventListener('MSPointerUp', _pointerUpListener, true);
		}).call(this);
		// fucking IE10 bug : it doesn't cancel click event
		// when gesture events are cancelled
		_pointerClickListener=function(event){
				if(this.findButton(event.target)) {
					event.preventDefault();
					event.stopPropagation();
				}
			}.bind(this);
		this.rootElement.addEventListener('click',_pointerClickListener,true);
	} else {
		// Touch events
		if(!!('ontouchstart' in window)) {
			(function() {
				// a var keepin' the touchstart element
				var curElement=null;
				_touchstartListener=function(event) {
					curElement=this.findButton(event.target)||this.findForm(event.target);
					curElement&&event.preventDefault()||event.stopPropagation();
				}.bind(this);
				this.rootElement.addEventListener('touchstart', _touchstartListener, true);
				// checking it's the same at touchend, capturing command if so
				_touchendListener=function(event) {
					if(curElement==this.findButton(event.target)) {
						this.captureButton(event);
					} else if(curElement===this.findForm(event.target)) {
						this.captureForm(event);
					} else {
						curElement=null;
					}
				}.bind(this);
				this.rootElement.addEventListener('touchend', _touchendListener,true);
			}).call(this);
		}
	// Clic events
	_clickListener=this.captureButton.bind(this);
	this.rootElement.addEventListener('click', _clickListener, true);
	}
	// Keyboard events
	// Cancel keydown action (no click event)
	_keydownListener=function(event) {
		if(13===event.keyCode&&(this.findButton(event.target)
			||this.findForm(event.target))) {
			event.preventDefault()&&event.stopPropagation();
		}
	}.bind(this);
	this.rootElement.addEventListener('keydown', _keydownListener, true);
	// Fire on keyup
	_keyupListener=function(event) {
		if(13===event.keyCode&&!event.ctrlKey) {
			if(this.findButton(event.target)) {
				this.captureButton.apply(this, arguments);
			} else {
				this.captureForm.apply(this, arguments);
			}
		}
	}.bind(this);
	this.rootElement.addEventListener('keyup', _keyupListener, true);
	// event listeners for forms submission
	_formSubmitListener=this.captureForm.bind(this);
	this.rootElement.addEventListener('submit', _formSubmitListener, true);
	// event listeners for form changes
	_formChangeListener=this.formChange.bind(this);
	this.rootElement.addEventListener('change', _formChangeListener, true);
	this.rootElement.addEventListener('select', _formChangeListener, true);

	// Common command executor
	this.executeCommand=function (event,command,element) {
		if(!_commands) {
			throw Error('Cannot execute command on a disposed Commandor object.');
		}
		// checking for the prefix
		if(0!==command.indexOf(this.prefix))
			return false;
		// removing the prefix
		command=command.substr(this.prefix.length);
		var chunks=command.split('?');
		// the first chunk is the command path
		var callback=_commands;
		var nodes=chunks[0].split('/');
		for(var i=0, j=nodes.length; i<j-1; i++) {
			if(!callback[nodes[i]]) {
				throw Error('Cannot execute the following command "'+command+'".');
			}
			callback=callback[nodes[i]];
		}
		if('function' !== typeof callback[nodes[i]]) {
			throw Error('Cannot execute the following command "'+command+'", not a fucntion.');
		}
		// Preparing arguments
		var args={};
		if(chunks[1]) {
			chunks=chunks[1].split('&');
			for(var k=0, l=chunks.length; k<l; k++) {
				var parts=chunks[k].split('=');
				if(undefined!==parts[0]&&undefined!==parts[1]) {
					args[parts[0]]=decodeURIComponent(parts[1]);
				}
			}
		}
		// executing the command fallback
		if(callback.____internal) {
			return !!!((callback[nodes[i]])(event,args,element));
		} else {
			return !!!(callback[nodes[i]](event,args,element));
		}
		return !!!callback(event,args,element);
	};

	// Add a callback or object for the specified path
	this.suscribe=function(path,callback) {
		if(!_commands) {
			throw Error('Cannot suscribe commands on a disposed Commandor object.');
		}
		var nodes=path.split('/'),
			command=_commands;
		for(var i=0, j=nodes.length-1; i<j; i++) {
			if((!command[nodes[i]])||!(command[nodes[i]] instanceof Object)) {
				command[nodes[i]]={'____internal':true};
			}
			command=command[nodes[i]];
			if(!command.____internal) {
				throw Error('Cannot suscribe commands on an external object.');
			}
		}
		command[nodes[i]]=callback;
	};

	// Delete callback for the specified path
	this.unsuscribe=function(path) {
		if(!_commands) {
			throw Error('Cannot unsuscribe commands of a disposed Commandor object.');
		}
		var nodes=path.split('/'),
			command=_commands;
		for(var i=0, j=nodes.length-1; i<j; i++) {
			command=command[nodes[i]]={};
		}
		if(!command.____internal) {
			throw Error('Cannot unsuscribe commands of an external object.');
		}
		command[nodes[i]]=null;
	};

	// Dispose the commandor object (remove event listeners)
	this.dispose=function() {
		_commands=null;
		if(_pointerDownListener) {
			this.rootElement.removeEventListener('MSPointerDown',
				_pointerDownListener, true);
			this.rootElement.removeEventListener('MSPointerUp',
				_pointerUpListener, true);
			this.rootElement.removeEventListener('click',
				_pointerClickListener, true);
		}
		if(_touchstartListener) {
			this.rootElement.removeEventListener('touchstart',
				_touchstartListener, true);
			this.rootElement.removeEventListener('touchend',
				_touchendListener, true);
		}
		this.rootElement.removeEventListener('click', _clickListener, true);
		this.rootElement.removeEventListener('keydown', _keydownListener, true);
		this.rootElement.removeEventListener('keyup', _keyupListener, true);
		this.rootElement.removeEventListener('change', _formChangeListener, true);
		this.rootElement.removeEventListener('select', _formChangeListener, true);
		this.rootElement.removeEventListener('submit', _formSubmitListener, true);
	};
};

// Look for a button
Commandor.prototype.findButton=function(element) {
	while(element&&element.parentNode) {
		if('A'===element.nodeName
			&&element.hasAttribute('href')
			&&-1!==element.getAttribute('href').indexOf(this.prefix)) {
			return element;
		}
		if('INPUT'===element.nodeName&&element.hasAttribute('type')
			&&(element.getAttribute('type')=='submit'
					||element.getAttribute('type')=='button')
			&&element.hasAttribute('formaction')
			&&-1!==element.getAttribute('formaction').indexOf(this.prefix)
			) {
			return element;
		}
		if(element===this.rootElement) {
			return null;
		}
		element=element.parentNode;
	}
	return null;
};

// Look for a form
Commandor.prototype.findForm=function(element) {
	if('FORM'===element.nodeName||
		('INPUT'===element.nodeName&&element.hasAttribute('type')
		&&'submit'===element.getAttribute('type'))) {
		while(element&&element.parentNode) {
			if('FORM'===element.nodeName&&element.hasAttribute('action')
				&&-1!==element.getAttribute('action').indexOf(this.prefix)) {
				return element;
			}
			if(element===this.rootElement) {
				return null;
			}
			element=element.parentNode;
		}
		return element;
	}
	return null;
};

// Look for form change
Commandor.prototype.findFormChange=function(element) {
	while(element&&element.parentNode) {
		if('FORM'===element.nodeName&&element.hasAttribute('action')
			&&-1!==element.getAttribute('action').indexOf(this.prefix)) {
			return element;
		}
		if(element===this.rootElement) {
			return null;
		}
		element=element.parentNode;
	}
	return element;
};

// Extract the command for a button
Commandor.prototype.doCommandOfButton=function(element, event) {
	var command='';
	// looking for a button with formaction attribute
	if('INPUT'===element.nodeName) {
		command=element.getAttribute('formaction');
	// looking for a link
	} else if('A'===element.nodeName) {
		command=element.getAttribute('href');
	}
	// executing the command
	this.executeCommand(event,command,element);
};

// Button event handler
Commandor.prototype.captureButton=function(event) {
	var element=this.findButton(event.target);
	// if there is a button, stop event
	if(element) {
		// if the button is not disabled, run the command
		if((!element.hasAttribute('disabled'))
			||'disabled'===element.getAttribute('disabled')) {
			this.doCommandOfButton(element, event);
		}
		event.stopPropagation()||event.preventDefault();
	}
};

// Form change handler
Commandor.prototype.formChange=function(event) {
	// find the evolved form
	var element=this.findFormChange(event.target),
		command='';
	// searching the data-change attribute containing the command
	if(element&&'FORM'===element.nodeName
		&&element.hasAttribute('data-change')) {
		command=element.getAttribute('data-change');
	}
	// executing the command
	command&&this.executeCommand(event,command,element);
};

// Extract the command for a button
Commandor.prototype.doCommandOfForm=function(element, event) {
	var command='';
	// looking for a button with formaction attribute
	if('FORM'===element.nodeName) {
		command=element.getAttribute('action');
	}
	// executing the command
	this.executeCommand(event,command,element);
};

// Form command handler
Commandor.prototype.captureForm=function(event) {
	var element=this.findForm(event.target);
	// if there is a button, stop event
	if(element) {
		// if the button is not disabled, run the command
		if((!element.hasAttribute('disabled'))
			||'disabled'===element.getAttribute('disabled')) {
			this.doCommandOfForm(element, event);
		}
		event.stopPropagation()||event.preventDefault();
	}
};

module.exports = Commandor;


},{}],2:[function(require,module,exports){
/**
 * requestAnimationFrame version: "0.0.17" Copyright (c) 2011-2012, Cyril Agosta ( cyril.agosta.dev@gmail.com) All Rights Reserved.
 * Available via the MIT license.
 * see: http://github.com/cagosta/requestAnimationFrame for details
 *
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 * MIT license
 *
 */


( function( global ) {


    ( function() {


        if ( global.requestAnimationFrame ) {

            return;

        }

        if ( global.webkitRequestAnimationFrame ) { // Chrome <= 23, Safari <= 6.1, Blackberry 10

            global.requestAnimationFrame = global[ 'webkitRequestAnimationFrame' ];
            global.cancelAnimationFrame = global[ 'webkitCancelAnimationFrame' ] || global[ 'webkitCancelRequestAnimationFrame' ];

        }

        // IE <= 9, Android <= 4.3, very old/rare browsers

        var lastTime = 0;

        global.requestAnimationFrame = function( callback ) {

            var currTime = new Date().getTime();

            var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );

            var id = global.setTimeout( function() {

                callback( currTime + timeToCall );

            }, timeToCall );

            lastTime = currTime + timeToCall;

            return id; // return the id for cancellation capabilities

        };

        global.cancelAnimationFrame = function( id ) {

            clearTimeout( id );

        };

    } )();

    if ( typeof define === 'function' ) {

        define( function() {

            return global.requestAnimationFrame;

        } );

    }

} )( window );
},{}],3:[function(require,module,exports){
// HTML5 Sounds manager
function Sounds(folder,loadCallback) {
	if(!folder)
		throw new Error('No folder given for sounds !')
	// sound is on by default
	this.muted=false;
	// contains sounds elements
	this.sounds={};
	// contains sounds to load
	this.soundsToLoad=new Array();
	// callback executed when each sounds are loaded
	this.loadedSounds=loadCallback;
	// detecting supported extensions
	var sound=document.createElement('audio');
	this.exts=[];
	if(sound.canPlayType('audio/ogg'))
		this.exts.push('ogg');
	if(sound.canPlayType('audio/mp3'))
		this.exts.push('mp3');
	if(sound.canPlayType('audio/x-midi'))
		this.exts.push('mid');
	// folder containing sounds
	this.folder=folder;
}

// register a sound to load
Sounds.prototype.register = function(name, extensions, iterations, volume) {
	// creating the Audio element
	var sound=new Audio();
	// Add in the sounds to load list
	this.soundsToLoad.push(sound);
	sound.setAttribute('preload','auto');
	if(extensions.every(function(ext) {
		if(-1===this.exts.indexOf(ext))
			return true;
		sound.setAttribute('src',this.folder+'/'+name+'.'+ext);
		return false;
	}.bind(this)))
		return;
	// iterating as needed
	if(Infinity===iterations)
		sound.setAttribute('loop','loop');
	else if(iterations>1)
		sound.setAttribute('data-iterations',iterations);
	if(volume)
		sound.setAttribute('data-volume',volume);
	sound.setAttribute('data-name',name);
	// adding callback
	sound.addEventListener('canplaythrough', this.soundLoaded.bind(this));
},

// remove soundsToLoad when loaded
Sounds.prototype.soundLoaded = function(event) {
	// getting the index of the loaded sound
	var index=this.soundsToLoad.indexOf(event.target);
	if(index>=0) {
		var sound=this.soundsToLoad.splice(index,1)[0];
		this.sounds[sound.getAttribute('data-name')]=sound;
	}
	// if no more sounds to load, execute callback
	if(this.loadedSounds&&!this.soundsToLoad.length)
		this.loadedSounds();
};

// Play a sound
Sounds.prototype.play = function(name,iterations) {
	// if the sound exists
	if(this.sounds[name]&&(this.sounds[name].hasAttribute('loop')||!this.muted)) {
		// getting iteration count
		if(!iterations) {
			iterations=1;
			if(this.sounds[name].hasAttribute('data-iterations'))
				iterations=parseInt(
					this.sounds[name].getAttribute('data-iterations'),10);
		}
		// cloning the node and playing the sound
		this.sounds[name].currentlyPlayed=
			this.sounds[name].cloneNode();
		if(this.sounds[name].hasAttribute('data-volume')) {
			this.sounds[name].currentlyPlayed.volume=
				this.sounds[name].currentlyPlayed
					.getAttribute('data-volume');
		}
		// if the sound is not muted and it's a background sound
		if(!this.muted) {
			this.sounds[name].currentlyPlayed.play();
			this.sounds[name].currentlyPlayed
				.addEventListener('ended', function() {
				if(--iterations)
					this.sounds[name].currentlyPlayed.play();
				else
					this.sounds[name].currentlyPlayed=null;
			}.bind(this));
		}
	}
};

// Stops a sound
Sounds.prototype.stop = function(name) {
	if(this.sounds[name].currentlyPlayed)
		this.sounds[name].currentlyPlayed.pause();
	this.sounds[name].currentlyPlayed=null;
};

// Mutes a sound
Sounds.prototype.mute = function(muted) {
	for(var name in this.sounds) {
		if(this.sounds[name].currentlyPlayed) {
			this.sounds[name].currentlyPlayed[muted?'pause':'play']();
		}
	}
	this.muted=muted;
};

module.exports = Sounds;


},{}],4:[function(require,module,exports){
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


},{"./View":11,"./ViewGame":12,"./ViewOptions":13,"./ViewUpdate":14,"commandor":1,"requestanimationframe":2,"sounds":3}],5:[function(require,module,exports){
function Ball (game) {
	this.game = game;
	this.size = 2.5;
	this.throughtWall = 0;
	this.fit();
	this.lastX=this.x =(this.game.width/2)-(this.r/2);
	this.lasty=this.y = this.game.height-this.game.bar.height-(this.r*2)-10;
	this.wonderMode = 0;
	this.stop();
	this.angle = (9+Math.floor((Math.random()*6)+1))*Math.PI/8;
}

Ball.prototype.fit = function() {
	this.lastR=this.r = this.size*this.game.aspectRatio;
};

Ball.prototype.draw = function() {
	// Drawing
	this.game.context.fillStyle = (this.wonderMode ? "#FF0000" : "#333");
	this.game.context.beginPath();
	this.game.context.arc(0|this.x,0|this.y,0|(this.r-1),0,Math.PI*2,true);
	this.game.context.fill();
};

Ball.prototype.start = function() {
	this.speed=(0.10+(this.game.level/100))*this.game.aspectRatio;
};

Ball.prototype.stop = function() {
	this.speed=0;
	this.glueCounter = 400;
};

Ball.prototype.move = function(delta) {
	if(this.speed) {
		var nextX=this.x + (Math.cos(this.angle)*this.speed*delta);
		var nextY=this.y + (Math.sin(this.angle)*this.speed*delta);
		if(nextY >this.game.height) {
			this.game.app.sounds.play('crash');
			if(this.game.balls.length>1) {
				this.game.balls.splice(this.game.balls.indexOf(this),1);
			} else {
				this.stop();
				this.inverseAngleY();
				this.game.bar.lives--;
			}
		} else {
			var hit=0, newHit=0;
			for(var i=this.game.bricks.length-1; i>=0; i--) {
				newHit=this.game.bricks[i].hit(nextX,nextY,this.r);
				if(newHit&&!this.game.bricks[i].remove(this)) {
					i--;
					hit=hit|newHit;
				}
			}
			if(this.wonderMode<1) {
				if(hit&1||hit&2) {
					this.inverseAngleX();
				}
				if(hit&4||hit&8) {
					this.inverseAngleY();
				}
			} else if(hit) {
				this.wonderMode--;
			}
			if(!hit) {
				if(nextX< 0) {
					this.inverseAngleX();
					nextX=this.r;
				} else if(nextX > this.game.width) {
					this.inverseAngleX();
					nextX=this.game.width-this.r;
				}
				this.x=nextX;
				if(nextY < 0) {
					this.inverseAngleY();
					nextY=this.r;
				} else if(nextX+this.r>this.game.bar.x
					&&nextX-this.r<this.game.bar.x+this.game.bar.width
					&&nextY+this.r>this.game.bar.y
					&&nextY<this.game.bar.y+(this.game.bar.height/2)) {
					this.game.app.sounds.play('boing2');
					this.inverseAngleY(
						(((nextX-this.game.bar.x-(this.game.bar.width/2))
						/(this.game.bar.width/2))/2)*-(Math.PI/5)
					);
					if(this.angle<9*Math.PI/8&&this.angle>4*Math.PI/8) {
						this.angle=9*Math.PI/8;
					} else if(this.angle>15*Math.PI/8) {
						this.angle=15*Math.PI/4;
					}
					nextY=this.game.bar.y-this.r;
					if(this.game.bar.glueMode) {
						this.stop();
					}
				}
			this.y=nextY;
			}
		}
	} else {
		this.glueCounter-=delta/10;
		this.x=this.game.bar.x+this.game.bar.width/2;
		this.y=this.game.bar.y-this.game.bar.height-(this.r/2);
		if(this.glueCounter<1) {
			this.start();
		}
	}
};

Ball.prototype.inverseAngleX = function() {
	this.angle=(Math.PI - this.angle)%(2*Math.PI);
};

Ball.prototype.inverseAngleY = function(deviation) {
 		this.angle=(2*Math.PI - this.angle -(deviation?deviation:0))%(2*Math.PI);
};

module.exports = Ball;


},{}],6:[function(require,module,exports){
var LazerShot = require('./LazerShot');
var GunShot = require('./GunShot');

function Bar (game) {
	this.game = game;
	this.sizeFactor=3;
	this.fit();
	this.x = (this.game.width/2)-(this.width/2);
	this.fireMode='';
	this.maxShots=1;
	this.speed=1;
	this.lives=3;
	this.reverse=false;
	this.speedLimit=8;
	this.direction=0;
	this.glueMode=false;
	this.shots=new Array();
}

Bar.prototype.setMode = function(mode) {
	switch(mode) {
		case 'xs':
			this.sizeFactor=1;
			break;
		case 's':
			this.sizeFactor=2;
			break;
		case 'm':
			this.sizeFactor=3;
			break;
		case 'l':
			this.sizeFactor=4;
			break;
		case 'xl':
			this.sizeFactor=5;
			break;
	}
	this.width = this.sizeFactor*10*this.game.aspectRatio;
};

Bar.prototype.fit = function() {
	this.width = this.sizeFactor*10*this.game.aspectRatio;
	this.height = 5*this.game.aspectRatio;
	this.yMargin = 5*this.game.aspectRatio;
	this.y = this.game.height-this.height-this.yMargin;
};

Bar.prototype.draw = function() {
	this.game.context.fillStyle = "#333";
	this.game.context.fillRect(0|this.x, 0|this.y, 0|this.width, 0|this.height);
};

Bar.prototype.fire = function() {
	if(this.fireMode&&this.shots.length<=this.maxShots) {
		this.shots.push(new (this.fireMode=='Lazer'?LazerShot:GunShot)(
			this.game, this.x+(this.width/2), this.y
		));
	}
};

Bar.prototype.moveTo = function(x) {
	if(x!=this.x) {
		var maxX = this.game.width - this.width;
		if(x<=0) {
			this.x=0;
		} else if(x < maxX){
			this.x = x;
		} else {
			this.x = maxX;
		}
	}
};

Bar.prototype.move = function(delta) {
	if(this.direction!=0) {
		this.moveTo(this.x+(((this.reverse?-1:1)*this.direction
			*this.speed*(this.game.aspectRatio/5)*delta/10)));
		if(this.speed<this.speedLimit) {
			this.speed+=1*(delta/10);
		}
	}
};

Bar.prototype.setDirection = function(direction) {
	if(direction!=this.direction) {
		this.speed=0;
	}
	this.direction=direction;
};

module.exports = Bar;


},{"./GunShot":9,"./LazerShot":10}],7:[function(require,module,exports){
var Goodie = require('./Goodie');

function Brick(game,x,y,w,h) {
	this.game = game;
	this.width = w; this.height = h;
	this.y = y;
	this.x = x;
	this.solidity = Math.floor((Math.random()*6+this.game.level)+1);
	if(this.solidity<6) {
		this.solidity=1;
	} else if(this.solidity<7) {
		this.solidity=2;
	} else if(this.solidity<9) {
		this.solidity=3;
	}	else {
		this.solidity=4;
	}
};

Brick.prototype.draw = function() {
	switch(this.solidity) {
		case 1:
			this.game.context.fillStyle = "#e76500"; // Normal
			break;
		case 2:
			this.game.context.fillStyle = "#b02d00"; // Red
			break;
		case 3:
			this.game.context.fillStyle = "#612c00"; // Hard
			break;
		case 3:
			this.game.context.fillStyle = "#612c00"; // Hard
			break;
		case 4:
			this.game.context.fillStyle = "#a2a2a2"; // Metal
			break;
	}
	this.game.context.fillRect(this.x, this.y, this.width, this.height);
};

Brick.prototype.clear = function() {
	this.game.context.clearRect(this.x-1, this.y-1,
		this.width+2, this.height+2);
};

Brick.prototype.remove = function(ball) {
	this.game.app.sounds.play('boing');
	this.solidity--;
	if(!this.solidity) {
		this.game.score+=1;
		this.game.bricks.splice(this.game.bricks.indexOf(this),1);
		if(this.game.goodies.length<5
			&&Math.floor((Math.random()*5+this.game.level)+1)>4) {
			this.game.goodies.push(new Goodie(this.game,ball,this.x,this.y));
		}
	}
};

Brick.prototype.hit = function(x,y,r) {
	var hit=0;
	if(x+r>this.x&&x-r<this.x+this.width
		&&y+r>this.y&&y-r<this.y+this.height) {
		if(x>=this.x+this.width) {
			hit+=1 // hit on right
		} else if(x<=this.x) {
			hit+=2 // hit on left
		}
		if(y>=this.y+this.height) {
			hit+=4; // hit on bottom
		} else if(y<=this.y) {
			hit+=8 // hit on top
		}
	}
	return hit;
};

module.exports = Brick;


},{"./Goodie":8}],8:[function(require,module,exports){
var Ball = require('./Ball');

function Goodie (game,ball,x,y) {
	this.game = game;
	this.ball = ball;
	this.width = (15*this.game.aspectRatio)+5;
	this.height = 10*this.game.aspectRatio;
	this.y = y;
	this.x = x;
	this.speed = Math.floor((Math.random()*3)+1);
	this.type = Math.floor(Math.random()*18);
}

// Consts
Goodie.TYPES=['XS', 'S', 'M', 'L', 'XL', 'Glue', 'Gun', 'Lazer', 'Doo', 'Ball',
	 'Brake', 'Speed', 'Small', 'Medium', 'Big', 'Wonder', '1UP', 'Rev'];

Goodie.prototype.draw = function() {
	var x=0|this.x, y=0|this.y,
		w=0|this.width, mw=0|(this.width/2),
		h=0|this.height, mh=0|(this.height/2);
	switch(this.speed) {
		case 1:
			this.game.context.fillStyle = "#e76500"; // Normal
			break;
		case 2:
			this.game.context.fillStyle = "#b02d00"; // Red
			break;
		case 3:
			this.game.context.fillStyle = "#612c00"; // Hard
			break;
	}
	this.game.context.fillRect(x+5, y, w-10, h);
	this.game.context.beginPath();
	this.game.context.moveTo(x,y+mh);
	this.game.context.lineTo(x+5,y);
	this.game.context.lineTo(x+5,y+h);
	this.game.context.fill();
	this.game.context.beginPath();
	this.game.context.moveTo(x+w,y+mh);
	this.game.context.lineTo(x+w-5,y);
	this.game.context.lineTo(x+w-5,y+h);
	this.game.context.fill();
	this.game.context.fillStyle = '#ffffff';
	this.game.context.strokeStyle = '#e76500';
	this.game.context.textBaseline='top';
	this.game.context.font=(h-2)+'px Helvetica bold, sans-serif';
	this.game.context.textAlign='center';
	this.game.context.fillText(Goodie.TYPES[this.type], x+mw, y, w);
};

Goodie.prototype.remove = function(catched) {
	this.game.goodies.splice(this.game.goodies.indexOf(this),1);
	this.game.app.sounds.play('boing');
	if(catched) {
		switch(this.type) {
			case 0:
				this.game.bar.setMode('xs');
				this.game.app.sounds.play('bleep');
				break;
			case 1:
				this.game.bar.setMode('s');
				this.game.app.sounds.play('bleep');
				break;
			case 2:
				this.game.bar.setMode('m');
				this.game.app.sounds.play('bleep');
				break;
			case 3:
				this.game.bar.setMode('l');
				this.game.app.sounds.play('bleep');
				break;
			case 4:
				this.game.bar.setMode('xl');
				this.game.app.sounds.play('bleep');
				break;
			case 5:
				this.game.bar.glueMode=true;
				break;
			case 6:
				if(this.game.bar.fireMode=='Gun')
					this.game.bar.maxShots++;
				else
					this.game.bar.fireMode='Gun';
				break;
			case 7:
					this.game.bar.fireMode='Lazer';
					this.game.bar.maxShots=1;
				break;
			case 8:
				this.game.bar.fireMode='';
				this.game.bar.maxShots=1;
				this.game.bar.glueMode=false;
				this.game.bar.speedLimit=5;
				this.game.app.sounds.play('fart');
				break;
			case 9:
				this.game.balls.push(new Ball(this.game));
				break;
			case 10:
				this.game.bar.speedLimit--;
				break;
			case 11:
				this.game.bar.speedLimit++;
				break;
			case 12:
				this.ball.size=1.5;
				this.ball.fit();
				break;
			case 13:
				this.ball.size=2.5;
				this.ball.fit();
				break;
			case 14:
				this.ball.size=3.5;
				this.ball.fit();
				break;
			case 15:
				this.ball.wonderMode+=10;
				break;
			case 15:
				this.game.balls[0].throughtWall+=10;
				break;
			case 16:
				this.game.bar.lives+=1;
				break;
			case 17:
				this.game.bar.reverse=!this.game.bar.reverse;
				break;
		}
	}
};

Goodie.prototype.move = function(delta) {
	var nextY=this.y + (this.speed*delta/10);
	if(nextY >this.game.height) {
		this.remove(false);
	} else if(this.x+(this.width/2)>this.game.bar.x
			&&this.x-(this.width/2)<this.game.bar.x+this.game.bar.width
			&&nextY+this.height>this.game.bar.y
			&&nextY<this.game.bar.y+this.game.bar.height) {
		this.remove(true);
	} else {
		this.y=nextY;
	}
};

Goodie.prototype.hit = function(x,y,r) {
	var hit=0;
	if(x+r>this.x&&x-r<this.x+this.width
		&&y+r>this.y&&y-r<this.y+this.height) {
		if(x>=this.x+this.width) {
			hit+=1 // hit on right
		} else if(x<=this.x) {
			hit+=2 // hit on left
		}
		if(y>=this.y+this.height) {
			hit+=4; // hit on bottom
		} else if(y<=this.y) {
			hit+=8 // hit on top
		}
	}
	return hit;
};

module.exports = Goodie;

},{"./Ball":5}],9:[function(require,module,exports){
function GunShot(game,x,y) {
	this.game = game;
	this.width = 0.5*this.game.aspectRatio;
	this.height = 2*this.game.aspectRatio;
	this.x = x;
	this.y = y;
	this.game.app.sounds.play('gunshot');
}

GunShot.prototype.draw = function() {
	this.game.context.fillStyle = "#ff0000";
	this.game.context.fillRect(0|this.x, 0|this.y, 0|this.width, 0|this.height);
};

GunShot.prototype.move = function(delta) {
	this.y-=delta/10;
	if(this.y<0) {
		this.remove();
	} else {
		for(var i=this.game.bricks.length-1; i>=0; i--) {
			if(this.game.bricks[i].x<this.x
				&&this.game.bricks[i].x+this.game.bricks[i].width>this.x
				&&this.game.bricks[i].y<this.y
				&&this.game.bricks[i].y+this.game.bricks[i].height>this.y) {
				this.game.context.clearRect(this.x-(this.width/2)-1, this.y,
					this.width+2, this.height);
				this.game.bricks[i].remove(this.game.balls[0]);
				this.remove();
				return;
			}
		}
	}
};

GunShot.prototype.remove = function() {
	this.game.bar.shots.splice(this.game.bar.shots.indexOf(this),1);
};

GunShot.prototype.clear = function() {
	this.game.context.clearRect(this.x-(this.width/2)-1, 0,
		this.width+2, this.height);
};

module.exports = GunShot;


},{}],10:[function(require,module,exports){
function LazerShot(game,x,y) {
	this.game = game;
	this.width = 0.5*this.game.aspectRatio;
	this.height = y;
	this.x = x;
	this.moveCount = 0;
	this.game.app.sounds.play('lazer');
	for(var i=this.game.bricks.length-1; i>=0; i--) {
		if(this.game.bricks[i].x<this.x&&this.game.bricks[i].x
				+this.game.bricks[i].width>this.x)
			this.game.bricks[i].remove(this.game.balls[0]);
	}
};

LazerShot.prototype.draw = function() {
	this.game.context.fillStyle = "#ff0000";
	this.game.context.fillRect(1|(this.x-(this.width/2)), 0,
		0|this.width, 0|this.height);
};

LazerShot.prototype.move = function() {
	this.moveCount++;
	if(this.moveCount>7)
		this.remove();
};

LazerShot.prototype.remove = function() {
	this.game.bar.shots.splice(this.game.bar.shots.indexOf(this),1);
};

module.exports = LazerShot;


},{}],11:[function(require,module,exports){
// Generic view
function View() {}

// Initializing the view
View.prototype.init=function (app,name) {
	// keeping a reference to the application object
	this.app=app;
	// saving the view name
	this.name=name;
	// selectin the corresponding element
	this.content=document.getElementById(name);
	if(!this.content)
		throw Error('Cannot get the view "'+name+'".');
	// displaying the view
	this.content.classList.add('selected');
};

// Simplified command registering
View.prototype.command=function (name,method) {
	// if no method, trying to get it automagically
	method=method||name;
	if(!this[method])
		throw Error('Cannot find the method "'+method+'".');
	// suscribing to the command
	this.app.cmdMgr.suscribe(this.name+'/'+name,
		this[method].bind(this));
};

// Unitializing the view
View.prototype.uninit=function () {
	// Deleting comamnds
	this.app.cmdMgr.unsuscribe(this.name);
	// hiding the view
	this.content.classList.remove('selected');
};

module.exports = View;


},{}],12:[function(require,module,exports){
var View = require('./View');
var Bar = require('./Bar');
var Ball = require('./Ball');
var Brick = require('./Brick');

// Manage game
function ViewGame() {
}

// Inherit of View
ViewGame.prototype = new View();

// Initialization
ViewGame.prototype.init = function (app,name) {
	// Calling the parent method
	View.prototype.init.bind(this)(app,name);
	// Registering view commands
	this.command('reset');
	this.command('pause');
	this.command('resume');
	this.command('exit');
	// Selecting template elements
	this.livesDisplayer=this.content.querySelector('span.lives span').firstChild;
	this.scoreDisplayer=this.content.querySelector('span.score span').firstChild;
	this.levelDisplayer=this.content.querySelector('span.level span').firstChild;
	this.element=this.content.querySelector('p.canvas');
	this.pauseButton=this.content.querySelector('a[href="app:Game/pause"]');
	this.resumeButton=this.content.querySelector('a[href="app:Game/resume"]');
	// Creating canvas
	this.canvas=document.createElement('canvas');
	this.rootPath='';
	this.fit();
	while(this.element.childNodes[0])
		this.element.removeChild(this.element.childNodes[0]);
	if(this.canvas.getContext) {
		this.element.appendChild(this.canvas);
		this.context = this.canvas.getContext('2d');
		this.reset();
		this.initEvents();
	}
	// Setting defaults
	this._gameOver=false;
};

ViewGame.prototype.exit = function() {
	this.pause();
	this.removeEvents();
	this.app.showView('Home');
};

ViewGame.prototype.reset = function() {
		this._gameOver=false;
		this.context.clearRect(0,0,this.width,this.height);
		this.bar= new Bar(this);
		this.balls=new Array(new Ball(this));
		this.goodies=new Array();
		this.shots=new Array();
		this.level=1;
		this.score=0;
		this.time=0;
		this.populate();
		this.app.showMessage(this.localize('level','Level $',this.level),3000);
		this.resume();
};

ViewGame.prototype.pause = function() {
	cancelAnimationFrame(this.timer);
	this.timer=0;
	this.pauseButton.setAttribute('disabled','disabled');
	this.resumeButton.removeAttribute('disabled');
};

ViewGame.prototype.resume = function() {
	if(!this.timer)
		this.timer=requestAnimationFrame(this.main.bind(this));
	this.pauseButton.removeAttribute('disabled');
	this.resumeButton.setAttribute('disabled','disabled');
};

ViewGame.prototype.resize = function() {
	this.fit();
	for(var i=this.balls.length-1; i>=0; i--) {
		this.balls[i].speed=0;
		this.balls[i].fit();
	}
	this.bar.fit();
	this.populate();
};

ViewGame.prototype.fit = function() {
	var canvasParent=this.canvas.parentNode;
	canvasParent&&canvasParent.removeChild(this.canvas);
	this.width=this.element.offsetWidth;
	this.height=this.element.offsetHeight;
	this.canvas.width=this.width;
	this.canvas.height=this.height;
	this.canvas.style.display='block';
	this.aspectRatio=this.height/200;
	canvasParent&&canvasParent.appendChild(this.canvas);
};

ViewGame.prototype.main = function(time) {
	var delta=time-(this.lastDrawTime||0);
	this.lastDrawTime=time;
	
	//this.levelDisplayer.textContent=0|(1000/delta);
	if(!this.bar.lives) {
		this.balls=new Array();
		this.pause();
		this.app.showMessage(this.localize('gameover','Game Over'),3000,this.reset.bind(this));
	}
	if(!this.bricks.length) {
		this.app.sounds.play('badadum');
		this.level++;
		this.app.showMessage(this.localize('level','Level $',this.level),3000);
		for(var i=this.balls.length-1; i>=0; i--) {
			this.balls[i].speed=0;
		}
		while(this.bar.shots[0]) {
			this.bar.shots[0].remove();
		}
		this.populate();
	}
	if(this.timer) {
		this.bar.move(delta);
		for(var i=this.bar.shots.length-1; i>=0; i--) {
			this.bar.shots[i].move(delta);
		}
		for(var i=this.balls.length-1; i>=0; i--) {
			this.balls[i].move(delta);
		}
		for(var i=this.goodies.length-1; i>=0; i--) {
			this.goodies[i].move(delta);
		}
		this.draw();
		this.timer=requestAnimationFrame(this.main.bind(this));
	}
};

ViewGame.prototype.draw = function() {
	if(this.timer) {
		// Clearing everything
		this.context.clearRect(0, 0, this.width, this.height);
		// Drawing scores/lives/time
		this.levelDisplayer.textContent=this.level;
		this.livesDisplayer.textContent=this.bar.lives;
		this.scoreDisplayer.textContent=this.score;
		// Drawing objects
		for(var i=this.bricks.length-1; i>=0; i--) {
			this.bricks[i].draw();
		}
		for(var i=this.goodies.length-1; i>=0; i--) {
			this.goodies[i].draw();
		}
		for(var i=this.balls.length-1; i>=0; i--) {
			this.balls[i].draw();
		}
		this.bar.draw();
		for(var i=this.bar.shots.length-1; i>=0; i--) {
			this.bar.shots[i].draw();
		}
	}
};

ViewGame.prototype.populate = function() {
	var bHeight=10*this.aspectRatio, bWidth=30*this.aspectRatio, bMargin=2,
		gXMargin=20*this.aspectRatio, gYMargin=20*this.aspectRatio;
	bXDecal=Math.floor(((this.width-(gXMargin*2))%(bWidth+bMargin))/2),
	bYDecal=Math.floor((((this.height/2)-(gYMargin*2))%(bHeight+bMargin))/2),
	this.bricks=new Array();
	for(var i=0, j=Math.floor((this.width-(gXMargin*2))/(bWidth+bMargin)); i<j; i++) {
		for(var k=0, l=Math.floor(((this.height/2)-(gYMargin))/(bHeight+bMargin)); k<l; k++) {
			this.bricks.push(new Brick(this,gXMargin+bXDecal+i*bWidth+bMargin*(i-1),
				gYMargin+bYDecal+k*bHeight+bMargin*(k-1),bWidth,bHeight));
		}
	}
};

/* Events management */
ViewGame.prototype.initEvents = function() {
	this.moveHandler=this.moveHandler.bind(this);
	this.clickHandler=this.clickHandler.bind(this);
	this.keyDownHandler=this.keyDownHandler.bind(this);
	this.keyUpHandler=this.keyUpHandler.bind(this);
	this.orientationHandler=this.orientationHandler.bind(this);
	this.resize=this.resize.bind(this);
	this.canvas.addEventListener('mousemove',this.moveHandler);
	this.canvas.addEventListener('click',this.clickHandler,true);
	this.canvas.addEventListener('contextmenu',this.clickHandler,true);
	window.addEventListener('keydown',this.keyDownHandler,true);
	window.addEventListener('keyup',this.keyUpHandler,true);
	window.addEventListener('deviceorientation', this.orientationHandler, true);
	window.addEventListener('resize', this.resize, true);
};

ViewGame.prototype.removeEvents = function() {
	this.canvas.removeEventListener('mousemove',this.moveHandler);
	this.canvas.removeEventListener('click',this.clickHandler,true);
	this.canvas.removeEventListener('contextmenu',this.clickHandler,true);
	window.removeEventListener('keydown',this.keyDownHandler,true);
	window.removeEventListener('keyup',this.keyUpHandler,true);
	window.removeEventListener('deviceorientation', this.orientationHandler, true);
	window.removeEventListener('resize', this.resize, true);
};

ViewGame.prototype.orientationHandler = function(e) {
	var portrait=(window.matchMedia&&window.matchMedia('(orientation: portrait)').matches);
	if((portrait&&e.beta<50)||((!portrait)&&(e.gamma<0&&e.gamma>-50)))
		this.bar.fire();
	if((portrait&&e.gamma<-15)||((!portrait)&&e.beta<-10))
		this.bar.setDirection(-1);
	else if((portrait&&e.gamma>15)||((!portrait)&&e.beta>10))
		this.bar.setDirection(1);
	else
		this.bar.setDirection(0);
};

ViewGame.prototype.moveHandler = function(e) {
	var x=e.pageX-this.canvas.offsetLeft-(this.bar.width/2);
	this.bar.moveTo(x);
};

ViewGame.prototype.clickHandler = function(e) {
	if(2===e.button) {
		this.bar.fire();
	} else {
		for(var i=this.balls.length-1; i>=0; i--) {
			if(!this.balls[i].speed) {
				this.balls[i].start();
				break;
			}
		}
	}
	e.preventDefault();
	e.stopPropagation();
};

ViewGame.prototype.keyDownHandler = function(e) {
	var used=true;
	switch(e.keyCode) {
		case 37:
			this.bar.setDirection(-1);
			break;
		case 39:
			this.bar.setDirection(1);
			break;
		default:
			used=false;
			break;
	}
	if(used) {
		e.preventDefault();
		e.stopPropagation();
	}
};

ViewGame.prototype.keyUpHandler = function(e) {
	var used=true;
	switch(e.keyCode) {
		case 32:
			this.bar.fire();
			break;
		case 37:
		case 39:
			this.bar.setDirection(0);
			break;
		case 38:
			for(var i=this.balls.length-1; i>=0; i--) {
				if(!this.balls[i].speed) {
					this.balls[i].start();
					break;
				}
			}
			break;
		default:
			used=false;
			break;
	}
	if(used) {
		e.preventDefault();
		e.stopPropagation();
	}
};

ViewGame.prototype.localize = function() {
	return arguments[1].replace('$',arguments[2]);
};

module.exports = ViewGame;


},{"./Ball":5,"./Bar":6,"./Brick":7,"./View":11}],13:[function(require,module,exports){
var View = require('./View');

// Manage game settings
function ViewOptions() { }

// Inherit of View
ViewOptions.prototype=new View();

// Initialization
ViewOptions.prototype.init=function (app,name) {
	// Calling the parent method
	View.prototype.init.bind(this)(app,name);
	// Registering view commands
	this.command('send');
	// Selecting temple elements
	document.getElementById('sounds').value=(this.app.sounds.muted?0:1);
	document.getElementById('sounds').checked=(document.fullscreenElement
		||document.mozFullScreenElement||document.webkitFullscreenElement);
};

ViewOptions.prototype.send=function (event, params) {
	var mute=(parseInt(event.target[0].value,10)?false:true);
	this.app.sounds.mute(mute);
	try {
		if(window.localStorage)
			window.localStorage.muted=(mute?'true':'');
	} catch(e) {}
	if(event.target[1].checked) {
		if((!document.fullscreenElement)&&(!document.mozFullScreenElement)
			&&!document.webkitFullscreenElement) {
			if(document.documentElement.requestFullscreen)
				document.documentElement.requestFullscreen();
			else if(document.documentElement.mozRequestFullScreen)
				document.documentElement.mozRequestFullScreen();
			else if(document.documentElement.webkitRequestFullscreen)
				document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	}
	else if(document.fullscreenElement||document.mozFullScreenElement
		||document.webkitFullscreenElement) {
		if(document.cancelFullScreen)
			document.cancelFullScreen();
		else if(document.mozCancelFullScreen)
			document.mozCancelFullScreen();
		else if(document.webkitCancelFullScreen)
			document.webkitCancelFullScreen();
	}
	this.app.showView('Home');
};

module.exports = ViewOptions;


},{"./View":11}],14:[function(require,module,exports){
var View = require('./View');

// Appcache update view
function ViewUpdate() { }

// Inherit of View
ViewUpdate.prototype=new View();

// Initialization
ViewUpdate.prototype.init=function (app,name) {
	// Calling the parent method
	View.prototype.init.bind(this)(app,name);
	// Registering view commands
	this.command('update');
};

// Updating the application
ViewUpdate.prototype.update=function () {
	document.location.reload();
};

module.exports = ViewUpdate;


},{"./View":11}]},{},[4]);
