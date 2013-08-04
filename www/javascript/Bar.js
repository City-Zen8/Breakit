// AMD + Global: r.js compatible
// Use START + END markers to keep module content only
(function(root,define){ define(['LazerShot','GunShot'],
	function(LazerShot, Gunshot) {
// START: Module logic start


	// Constructor
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
		this.speedLimit=5;
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
		this.game.context.clearRect(0, this.lastY,
			this.game.width, this.game.height);
		this.game.context.fillStyle = "#333";
		this.game.context.fillRect(this.x, this.y, this.width, this.height);
		this.lastX=this.x;
		this.lastY=this.y;
		this.lastWidth=this.width;
		this.lastHeight=this.height;
	};

	Bar.prototype.clear = function() {
		this.game.context.clearRect(0, this.lastY,
			this.game.width, this.game.height);
	};

	Bar.prototype.fire = function() {
		if(this.fireMode&&this.shots.length<=this.maxShots) {
			this.shots.push(new root[this.fireMode+'Shot'](
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

	Bar.prototype.move = function(e) {
		if(this.direction!=0) {
			this.moveTo(this.x+((this.reverse?-1:1)*this.direction
				*this.speed*this.game.aspectRatio/5));
			if(this.speed<this.speedLimit) {
				this.speed++;
			}
		}
	};

	Bar.prototype.setDirection = function(direction) {
		if(direction!=this.direction) {
			this.speed=0;
		}
		this.direction=direction;
	};


// END: Module logic end

	return Bar;

});})(this,typeof define === 'function' && define.amd ? define : function (name, deps, factory) {
	var root=this;
	if(typeof name === 'object') {
		factory=deps; deps=name; name='Bar';
	}
	this[name.substring(name.lastIndexOf('/')+1)]=factory.apply(this, deps.map(function(dep){
		return root[dep.substring(dep.lastIndexOf('/')+1)];
	}));
}.bind(this));
