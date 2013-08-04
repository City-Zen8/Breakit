// AMD + Global: r.js compatible
// Use START + END markers to keep module content only
(function(root,define){ define([], function() {
// START: Module logic start

	// Constructor
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
		if(this.wonderMode) {
			this.game.context.fillStyle = "#FF0000";
		} else {
			this.game.context.fillStyle = "#333";
		}
		this.game.context.beginPath();
		this.game.context.arc(this.x,this.y,this.r-1,0,Math.PI*2,true);
		this.game.context.fill();
		this.lastX=this.x;
		this.lastY=this.y;
		this.lastR=this.r;
	};

	Ball.prototype.clear = function() {
		this.game.context.clearRect(this.lastX-this.lastR, this.lastY-this.lastR,
			this.lastR*2, this.lastR*2);
	};

	Ball.prototype.start = function() {
		this.speed=(0.6+(this.game.level/10))*this.game.aspectRatio;
	};

	Ball.prototype.stop = function() {
		this.speed=0;
		this.glueCounter = 400;
	};

	Ball.prototype.move = function() {
		if(this.speed) {
			var nextX=this.x + Math.cos(this.angle)*this.speed;
			var nextY=this.y + Math.sin(this.angle)*this.speed;
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
			this.glueCounter--;
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

// END: Module logic end

	return Ball;

});})(this,typeof define === 'function' && define.amd ? define :
		function (name, deps, factory) {
	var root=this;
	if(typeof name === 'object') {
		factory=deps; deps=name; name='Ball';
	}
	this[name.substring(name.lastIndexOf('/')+1)]=factory.apply(
			this, deps.map(function(dep){
		return root[dep.substring(dep.lastIndexOf('/')+1)];
	}));
}.bind(this));
