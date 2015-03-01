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

