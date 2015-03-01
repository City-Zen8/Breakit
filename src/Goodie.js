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
