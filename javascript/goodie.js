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

var Goodie=new Class({
	initialize: function(game,ball,x,y){
		this.game = game;
		this.ball = ball;
		this.width = (15*this.game.aspectRatio)+5;
		this.height = 10*this.game.aspectRatio;
		this.y = y;
		this.x = x;
		this.speed = Math.floor((Math.random()*3)+1);
		this.type = Math.floor(Math.random()*17);
		},
	draw : function() {
		switch(this.speed)
			{
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
		this.game.context.fillRect(this.x+5, this.y, this.width-10, this.height);
		this.game.context.beginPath();
		this.game.context.moveTo(this.x,this.y+this.height/2);
		this.game.context.lineTo(this.x+5,this.y);
		this.game.context.lineTo(this.x+5,this.y+this.height);
		this.game.context.fill();
		this.game.context.beginPath();
		this.game.context.moveTo(this.x+this.width,this.y+this.height/2);
		this.game.context.lineTo(this.x+this.width-5,this.y);
		this.game.context.lineTo(this.x+this.width-5,this.y+this.height);
		this.game.context.fill();
		this.game.context.fillStyle = '#ffffff';
		this.game.context.strokeStyle = '#e76500';
		this.game.context.textBaseline='top';
		this.game.context.font=(this.height-2)+'px Helvetica bold, sans-serif';
		this.game.context.textAlign='center';
		switch(this.type)
			{
			case 0:
				this.game.context.fillText('XS', this.x+(this.width/2), this.y, this.width);
				break;
			case 1:
				this.game.context.fillText('S', this.x+(this.width/2), this.y, this.width);
				break;
			case 2:
				this.game.context.fillText('M', this.x+(this.width/2), this.y, this.width);
				break;
			case 3:
				this.game.context.fillText('L', this.x+(this.width/2), this.y, this.width);
				break;
			case 4:
				this.game.context.fillText('XL', this.x+(this.width/2), this.y, this.width);
				break;
			case 5:
				this.game.context.fillText('Glue', this.x+(this.width/2), this.y, this.width);
				break;
			case 6:
				this.game.context.fillText('Gun', this.x+(this.width/2), this.y, this.width);
				break;
			case 7:
				this.game.context.fillText('Lazer', this.x+(this.width/2), this.y, this.width);
				break;
			case 8:
				this.game.context.fillText('Doo', this.x+(this.width/2), this.y, this.width);
				break;
			case 9:
				this.game.context.fillText('Ball', this.x+(this.width/2), this.y, this.width);
				break;
			case 10:
				this.game.context.fillText('Brake', this.x+(this.width/2), this.y, this.width);
				break;
			case 11:
				this.game.context.fillText('Speed', this.x+(this.width/2), this.y, this.width);
				break;
			case 12:
				this.game.context.fillText('Small', this.x+(this.width/2), this.y, this.width);
				break;
			case 13:
				this.game.context.fillText('Medium', this.x+(this.width/2), this.y, this.width);
				break;
			case 14:
				this.game.context.fillText('Big', this.x+(this.width/2), this.y, this.width);
				break;
			case 15:
				this.game.context.fillText('Wonder', this.x+(this.width/2), this.y, this.width);
				break;
			case 16:
				this.game.context.fillText('1UP', this.x+(this.width/2), this.y, this.width);
				break;
			}
		this.lastX=this.x;
		this.lastY=this.y;
		this.lastWidth=this.width;
		this.lastHeight=this.height;
		},
	clear : function() {
		this.game.context.clearRect(this.lastX-1, this.lastY-1, this.lastWidth+2, this.lastHeight+2);
		},
	remove : function(catched) {
		this.game.goodies.splice(this.game.goodies.indexOf(this),1);
		this.game.playSound('boing');
		this.clear();
		if(catched)
			{
			switch(this.type)
				{
				case 0:
					this.game.bar.setMode('xs');
					this.game.playSound('bleep');
					break;
				case 1:
					this.game.bar.setMode('s');
					this.game.playSound('bleep');
					break;
				case 2:
					this.game.bar.setMode('m');
					this.game.playSound('bleep');
					break;
				case 3:
					this.game.bar.setMode('l');
					this.game.playSound('bleep');
					break;
				case 4:
					this.game.bar.setMode('xl');
					this.game.playSound('bleep');
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
					this.game.playSound('fart');
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
				}
			}
		},
	move : function(x,y,r) {
		var nextY=this.y + 0.5*this.speed;
		if(nextY >this.game.height)
			{
			//this.game.playSound('crash');
			this.remove(false);
			}
		else if(this.x+(this.width/2)>this.game.bar.x
						&&this.x-(this.width/2)<this.game.bar.x+this.game.bar.width
						&&nextY+this.height>this.game.bar.y
						&&nextY<this.game.bar.y+this.game.bar.height)
			{
			this.remove(true);
			}
		else
			{
			this.y=nextY;
			}
		},
	hit : function(x,y,r) {
		var hit=0;
		if(x+r>this.x&&x-r<this.x+this.width
			&&y+r>this.y&&y-r<this.y+this.height)
			{
			if(x>=this.x+this.width)
				hit+=1 // hit on right
			else if(x<=this.x)
				hit+=2 // hit on left
			if(y>=this.y+this.height)
				hit+=4; // hit on bottom
			else if(y<=this.y)
				hit+=8 // hit on top
			}
		return hit;
		},
	destruct : function() {
		}
});
