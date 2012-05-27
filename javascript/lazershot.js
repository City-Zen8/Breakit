/*
 * Copyright (C) 2012 Jonathan Kowalski
 * Copyright (C) 2012 Nicolas Froidure
 *
 * This file is free software;
 * you can redistribute it and/or modify it under the terms of the GNU
 * General Public License (GPL) as published by the Free Software
 * Foundation, in version 2. It is distributed in the
 * hope that it will be useful, but WITHOUT ANY WARRANTY of any kind.
 *
 */

var LazerShot=new Class({
	initialize: function(game,x,y) {
		this.game = game;
		this.width = 0.5*this.game.aspectRatio;
		this.height = y;
		this.x = x;
		this.game.play('lazer');
		this.draw();
		this.timer=this.remove.delay(200,this);
		},
	draw : function() {
			this.game.context.fillStyle = "#ff0000";
			this.game.context.fillRect(this.x-(this.width/2), 0, this.width, this.height);
			for(var i=this.game.bricks.length-1; i>=0; i--)
				{
				if(this.game.bricks[i].x<this.x&&this.game.bricks[i].x+this.game.bricks[i].width>this.x)
					this.game.bricks[i].remove();
				}
			this.game.context.fillRect(this.x-(this.width/2), 0, this.width, this.height);
		},
	remove : function() {
		this.clear();
		for(var i=this.game.bricks.length-1; i>=0; i--)
			{
			this.game.bricks[i].draw();
			}
		},
	clear : function() {
		clearTimeout(this.timer);
		this.game.context.clearRect(this.x-(this.width/2)-1, 0, this.width+2, this.height);
		this.game.bar.shots.splice(this.game.bar.shots.indexOf(this),1);
		},
	destruct : function() {
		}
});
