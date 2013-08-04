// AMD + global
(function(root,define){ define(['View', 'Bar', 'Ball', 'Brick'],
	function (View, Bar, Ball, Brick) {

	// Manage game
	function ViewGame() {
	}

	// Inherit of View
	ViewGame.prototype=new View();

	// Initialization
	ViewGame.prototype.init=function (app,name) {
		// Calling the parent method
		View.prototype.init.bind(this)(app,name);
		// Registering view commands
		this.command('reset');
		this.command('pause');
		this.command('resume');
		this.command('exit');
		// Selecting template elements
		this.element=this.content.querySelector('p.canvas');
		this.pauseButton=this.content.querySelector('a[href="app:Game/pause"]');
		this.resumeButton=this.content.querySelector('a[href="app:Game/resume"]');
		// Creating canvas
		this.canvas=document.createElement('canvas');
		this.rootPath='';
		// Trying to request animation frame
		this.requestAnimFrame = (function(){
				return  window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||null
		})();
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
		// Requesting the first draw
		if(this.requestAnimFrame)
			this.requestAnimFrame.call(window,this.draw.bind(this));
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
			this.populate();
			this.notice(this.localize('level','Level $',this.level));
			this.resume();
	};

	ViewGame.prototype.pause = function() {
		clearTimeout(this.timer);
		this.timer=0;
		this.pauseButton.setAttribute('disabled','disabled');
		this.resumeButton.removeAttribute('disabled');
	};

	ViewGame.prototype.resume = function() {
		if(!this.timer)
			this.timer=setTimeout(this.main.bind(this),30);
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
		this.width=this.element.offsetWidth;
		this.height=this.element.offsetHeight;
		this.canvas.width=this.width;
		this.canvas.height=this.height;
		this.canvas.style.display='block';
		this.aspectRatio=this.height/200;
	};

	ViewGame.prototype.main = function() {
		if(!this.bar.lives) {
			if(!this._gameOver) {
				this.balls=new Array();
				this.notice(this.localize('gameover','Game Over'));
				this._gameOver=true;
				this._gameOverCountdown=1000;
			} else if(this._gameOverCountdown<=0) {
				this.reset();
			}
		}
		if(!this.bricks.length) {
			this.app.sounds.play('badadum');
			this.level++;
			this.notice(this.localize('level','Level $',this.level));
			for(var i=this.balls.length-1; i>=0; i--) {
				this.balls[i].speed=0;
			}
			while(this.bar.shots[0]) {
				this.bar.shots[0].remove();
			}
			this.populate();
		}
		if(this.timer) {
			this.bar.move();
			for(var i=this.bar.shots.length-1; i>=0; i--) {
				this.bar.shots[i].move();
			}
			for(var i=this.balls.length-1; i>=0; i--) {
				this.balls[i].move();
			}
			for(var i=this.goodies.length-1; i>=0; i--) {
				this.goodies[i].move();
			}
			if(this._notice) {
				this._noticeDelay--;
			}
			if(this._gameOver) {
				this._gameOverCountdown--;
			}
			if(!this.requestAnimFrame) {
				this.draw();
			}
			this.timer=setTimeout(this.main.bind(this),5);
		}
	};

	ViewGame.prototype.draw = function() {
		if(this.timer) {
			// Clearing everything
			this.context.clearRect(0, 0, this.width, this.height);
			// Drawing scores/lives
			//this.context.clearRect(9, 9, this.width, 10*this.aspectRatio);
			this.context.fillStyle = '#000000';
			this.context.font=(10*this.aspectRatio)+'px Arial';
			this.context.textBaseline='top';
			this.context.textAlign='left';
			this.context.fillText(this.localize('lives','$ lives', this.bar.lives),
				10, 10,300);
			this.context.textAlign='right';
			this.context.fillText(this.localize('score','Score: $', this.score),
				this.width-10, 10,300);
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
			// Drawing notices
			if(this._notice) {
				if(this._noticeDelay>0) {
					this.context.fillStyle = '#000000';
				} else {
					this.context.strokeStyle='#FFFFFF';
					this.context.fillStyle = '#FFFFFF';
				}
				this.context.font=(30*this.aspectRatio)+'px Arial';
				this.context.textAlign='center';
				this.context.textBaseline='middle';
				this.context.fillText(this._notice,this.width/2, this.height/2);
				if(this._noticeDelay<=0) {
					this._notice='';
				}
			}
		}
		// Let's go to another draw
		if(this.requestAnimFrame) {
			this.requestAnimFrame.call(window,this.draw.bind(this));
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

	/* UI */
	ViewGame.prototype.notice = function(message) {
		this._notice=message;
		this._noticeDelay=1000;
	};

	ViewGame.prototype.localize = function() {
		return arguments[1].replace('$',arguments[2]);
	};

	return ViewGame;

});})(this,typeof define === 'function' && define.amd ? define : function (name, deps, factory) {
	var root=this;
	if(typeof name === 'object') {
		factory=deps; deps=name; name='ViewGame';
	}
	this[name.substring(name.lastIndexOf('/')+1)]=factory.apply(this, deps.map(function(dep){
		return root[dep.substring(dep.lastIndexOf('/')+1)];
	}));
}.bind(this));
