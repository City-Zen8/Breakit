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

var Ball=new Class({
	initialize: function(game) {
		this.game = game;
		this.size = 2.5;
		this.throughtWall = 0;
		this.fit();
		this.lastX=this.x =(this.game.width/2)-(this.r/2);
		this.lasty=this.y = this.game.height-this.game.bar.height-(this.r*2)-10;
		this.wonderMode = 0;
		this.stop();
		this.angle = (9+Math.floor((Math.random()*6)+1))*Math.PI/8;
		},
	fit : function() {
		this.lastR=this.r = this.size*this.game.aspectRatio;
		},
	draw : function() {
		// Drawing
		if(this.wonderMode)
			this.game.context.fillStyle = "#FF0000";
		else
			this.game.context.fillStyle = "#333";
		this.game.context.beginPath();
		this.game.context.arc(this.x,this.y,this.r-1,0,Math.PI*2,true);
		this.game.context.fill();
		this.lastX=this.x;
		this.lastY=this.y;
		this.lastR=this.r;
		},
	clear : function() {
		this.game.context.clearRect(this.lastX-this.lastR, this.lastY-this.lastR, this.lastR*2, this.lastR*2);
		},
	start : function() {
		this.speed=(0.6+(this.game.level/10))*this.game.aspectRatio;
		},
	stop : function() {
		this.speed=0;
		this.glueCounter = 400;
		},
	move : function() {
		if(this.speed)
			{
			var nextX=this.x + Math.cos(this.angle)*this.speed;
			var nextY=this.y + Math.sin(this.angle)*this.speed;
			if(nextY >this.game.height)
				{
				this.game.playSound('crash');
				if(this.game.balls.length>1)
					this.game.balls.splice(this.game.balls.indexOf(this),1);
				else
					{
					this.stop();
					this.inverseAngleY();
					this.game.bar.lives--;
					}
				}
			else
				{
				var hit=0, newHit=0;
				for(var i=this.game.bricks.length-1; i>=0; i--)
					{
					newHit=this.game.bricks[i].hit(nextX,nextY,this.r);
					if(newHit&&!this.game.bricks[i].remove(this))
						{
						i--;
						hit=hit|newHit;
						}
					}
				if(this.wonderMode<1)
					{
					if(hit&1||hit&2)
						{
						this.inverseAngleX();
						}
					if(hit&4||hit&8)
						{
						this.inverseAngleY();
						}
					}
				else if(hit)
					this.wonderMode--;
				if(!hit)
					{
					if(nextX< 0)
						{
						this.inverseAngleX();
						nextX=this.r;
						}
					else if(nextX > this.game.width)
						{
						this.inverseAngleX();
						nextX=this.game.width-this.r;
						}
					this.x=nextX;
					if(nextY < 0)
						{
						this.inverseAngleY();
						nextY=this.r;
						}
					else if(nextX+this.r>this.game.bar.x
						&&nextX-this.r<this.game.bar.x+this.game.bar.width
						&&nextY+this.r>this.game.bar.y
						&&nextY<this.game.bar.y+(this.game.bar.height/2))
						{
						this.game.playSound('boing2');
						this.inverseAngleY((((nextX-this.game.bar.x-(this.game.bar.width/2))/(this.game.bar.width/2))/2)*-(Math.PI/5));
						if(this.angle<9*Math.PI/8&&this.angle>4*Math.PI/8)
							{
							this.angle=9*Math.PI/8;
							}
						else if(this.angle>15*Math.PI/8)
							{
							this.angle=15*Math.PI/4;
							}
						nextY=this.game.bar.y-this.r;
						if(this.game.bar.glueMode)
							{
							this.stop();
							}
						}
					this.y=nextY;
					}
				}
			}
		else
			{
			this.glueCounter--;
			this.x=this.game.bar.x+this.game.bar.width/2;
			this.y=this.game.bar.y-this.game.bar.height-(this.r/2);
			if(this.glueCounter<1)
				this.start();
			}
		},
	inverseAngleX : function() {
		this.angle=(Math.PI - this.angle)%(2*Math.PI);
		},
	inverseAngleY : function(deviation) {
   		this.angle=(2*Math.PI - this.angle -(deviation?deviation:0))%(2*Math.PI);
		},
	destruct : function() {
		}
});
