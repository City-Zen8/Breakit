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

