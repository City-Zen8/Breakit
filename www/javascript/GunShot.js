// AMD + Global: r.js compatible
// Use START + END markers to keep module content only
(function(root,define){ define([], function() {
// START: Module logic start

	// Constructor
	function GunShot(game,x,y) {
		this.game = game;
		this.width = 0.5*this.game.aspectRatio;
		this.height = 2*this.game.aspectRatio;
		this.x = x;
		this.y = y;
		this.game.sounds.play('gunshot');
	}

	Gunshot.prototype.draw = function() {
		this.game.context.fillStyle = "#ff0000";
		this.game.context.fillRect(this.x, this.y, this.width, this.height);
	};

	Gunshot.prototype.move = function() {
		this.y-=this.height/4;
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

	Gunshot.prototype.remove = function() {
		this.game.bar.shots.splice(this.game.bar.shots.indexOf(this),1);
	};

	Gunshot.prototype.clear = function() {
		this.game.context.clearRect(this.x-(this.width/2)-1, 0,
			this.width+2, this.height);
	};

// END: Module logic end

	return GunShot;

});})(this,typeof define === 'function' && define.amd ? define :
		function (name, deps, factory) {
	var root=this;
	if(typeof name === 'object') {
		factory=deps; deps=name; name='GunShot';
	}
	this[name.substring(name.lastIndexOf('/')+1)]=factory.apply(
			this, deps.map(function(dep){
		return root[dep.substring(dep.lastIndexOf('/')+1)];
	}));
}.bind(this));
