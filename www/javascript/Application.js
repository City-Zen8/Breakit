// for static analysis with r.js
function staticAnalysis() {
	require(['ViewOptions','ViewGame','ViewUpdate']);
}
// AMD + global
(function(root,define){ define('Application',['View','require',
		'libs/commandor/Commandor','libs/sounds/Sounds'],
	function (View,require,Commandor,Sounds) {

	// Application constructor
	function Application(rootElement) {
		// Looking for a new version
		if(window.applicationCache) {
			window.applicationCache.addEventListener('updateready',function() {
				// asking player to update if he's not playing
				if((!(root.ViewMono||root.ViewMulti))||this.view instanceof root.ViewMono
					||this.view instanceof root.ViewMulti)
					this.showView('Update');
			}.bind(this));
		}
		// saving the rootElement ref
		this.rootElement=rootElement;
		// instanciating the command manager
		this.cmdMgr=new Commandor(rootElement);
		// Adding the changeView command
		this.cmdMgr.suscribe('changeView',
			this.changeView.bind(this));
		// instanciating the sound manager and adding sounds
		this.sounds=new Sounds('sounds');
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
			if(window.localStorage&&window.localStorage.muted)
				this.sounds.mute(!!window.localStorage.muted);
		} catch(e) {}
		// saving the message element ref
		this.message=document.querySelector('div.app div.message p');
		// websocket attemps
		this.wsAttempts=0;
		// showing the main view
		this.showView('Home');
	}

	// Messages management
	Application.prototype.showMessage=function (text,duration,callback) {
		if(this.messageTimeout)
			clearTimeout(this.messageTimeout);
		this.messageTimeout=setTimeout(this.hideMessage.bind(this),duration||1500);
		this.messageCallback=callback;
		this.message.firstChild.textContent=text;
		this.message.parentNode.classList.add('show');
	};

	Application.prototype.hideMessage=function () {
		this.message.parentNode.classList.remove('show');
		this.messageTimeout=null;
		this.messageCallback&&this.messageCallback();
		this.messageCallback=null;
	};

	// Views management
	Application.prototype.changeView=function (event,params) {
		this.showView(params.view);
	};

	Application.prototype.showView=function (name) {
		// uninitializing previous view
		if(this.displayedView) {
			this.displayedView.uninit();
		// Or hide initial loading view
		} else {
			document.getElementById('Loading').setAttribute('class','view');
		}
		// creating next view
		// testing global for view constructors
		if(root.View) {
			if(root['View'+name])
				this.displayedView=new root['View'+name]();
			else
				this.displayedView=new root.View();
			this.displayedView.init(this,name);
		} else {
			// RequireJS fallback
			require(['View'+name],function(ViewCustom) {
				// success
				this.displayedView=new ViewCustom();
				this.displayedView.init(this,name);
			}.bind(this),function(){
				// fail
				this.displayedView=new View();
				this.displayedView.init(this,name);
			}.bind(this));
		}
	};

	// launching the app
	new Application(document.querySelector('div.app'));

});})(this,typeof define === 'function' && define.amd ? define : function (name, deps, factory) {
	var root=this;
	if(typeof name === 'object') {
		factory=deps; deps=name; name='Application';
	}
	this[name.substring(name.lastIndexOf('/')+1)]=factory.apply(this, deps.map(function(dep){
		return root[dep.substring(dep.lastIndexOf('/')+1)];
	}));
}.bind(this));
