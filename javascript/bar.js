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

var Bar=new Class({
	initialize: function(game) {
		this.game = game;
		this.fit();
		this.x = (this.game.width/2)-(this.width/2);
		this.fireMode='Lazer';
		this.glueMode=false;
		this.draw();
		this.shots=new Array();
		},
	fit : function() {
		this.width = 30*this.game.aspectRatio;
		this.height = 5*this.game.aspectRatio;
		this.yMargin = 5*this.game.aspectRatio;
		this.y = this.game.height-this.height-this.yMargin;
		},
	draw : function() {
		this.game.context.fillStyle = "#333";
		this.game.context.fillRect(this.x, this.y, this.width, this.height);
		},
	remove : function() {
		this.game.context.clearRect(0, this.y, this.game.width, this.game.height);
		},
	fire : function() {
		if(this.shots.length<=10)
			this.shots.push(new window[this.fireMode+'Shot'](this.game, this.x+(this.width/2), this.y));
		},
	moveTo : function(x) {
		var maxX = this.game.width - this.width;
		if(x<=0)
			this.x=0;
		else if(x < maxX)
			this.x = x;
		else
			this.x = maxX;
		this.game.context.clearRect(0, this.y, this.game.width, this.game.height)
		this.draw();
		},
	move : function(e) {
		var x=e.page.x-this.game.canvas.getPosition().x-(this.width/2);
		if(x!=this.x)
			{
			this.moveTo(x);
			}
		},
	go : function(right) {
		this.moveTo(this.x+((right?1:-1)*10*this.game.aspectRatio));
		},
	destruct : function() {
		}
});
