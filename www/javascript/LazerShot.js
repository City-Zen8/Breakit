// AMD + Global: r.js compatible
// Use START + END markers to keep module content only
(function(root,define){ define([], function() {
// START: Module logic start

	// Constructor
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
		this.game.context.fillRect(this.x-(this.width/2), 0,
			this.width, this.height);
		};

	LazerShot.prototype.clear = function() {
		this.game.context.clearRect(this.x-(this.width/2)-1, 0,
			this.width+2, this.height);
	};

	LazerShot.prototype.move = function() {
		this.moveCount++;
		if(this.moveCount>7)
			this.remove();
	};

	LazerShot.prototype.remove = function() {
		this.game.bar.shots.splice(this.game.bar.shots.indexOf(this),1);
	};

// END: Module logic end

	return LazerShot;

});})(this,typeof define === 'function' && define.amd ? define :
		function (name, deps, factory) {
	var root=this;
	if(typeof name === 'object') {
		factory=deps; deps=name; name='LazerShot';
	}
	this[name.substring(name.lastIndexOf('/')+1)]=factory.apply(
			this, deps.map(function(dep){
		return root[dep.substring(dep.lastIndexOf('/')+1)];
	}));
}.bind(this));
