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

