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

