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
		this.sizeFactor=3;
		this.fit();
		this.x = (this.game.width/2)-(this.width/2);
		this.fireMode='';
		this.maxShots=1;
		this.speed=1;
		this.lives=3;
		this.speedLimit=5;
		this.direction=0;
		this.glueMode=false;
		this.shots=new Array();
		},
	setMode : function(mode) {
		switch(mode)
			{
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
		},
	fit : function() {
		this.width = this.sizeFactor*10*this.game.aspectRatio;
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
		if(this.fireMode&&this.shots.length<=this.maxShots)
			this.shots.push(new window[this.fireMode+'Shot'](this.game, this.x+(this.width/2), this.y));
		},
	moveTo : function(x) {
		if(x!=this.x)
			{
			var maxX = this.game.width - this.width;
			if(x<=0)
				this.x=0;
			else if(x < maxX)
				this.x = x;
			else
				this.x = maxX;
			}
		},
	move : function(e) {
		this.remove();
		if(this.direction!=0)
			{
			this.moveTo(this.x+(this.direction*this.speed*this.game.aspectRatio/5));
			if(this.speed<this.speedLimit)
				this.speed++;
			}
		},
	setDirection : function(direction) {
		if(direction!=this.direction)
			this.speed=0;
		this.direction=direction;
		},
	destruct : function() {
		}
});
