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
	initialize: function(game,x,y){
		this.game = game;
		this.width = (10*this.game.aspectRatio)+5;
		this.height = 10;
		this.y = y;
		this.x = x;
		this.speed = Math.floor((Math.random()*3)+1);
		this.type = Math.floor((Math.random()*9)+1);
		this.draw();
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
		this.game.context.fillStyle = '#000000';
		this.game.context.fillStyle = '#ffffff';
		this.game.context.font='10px Arial';
		this.game.context.textAlign='center';
		switch(this.type)
			{
			case 1:
				this.game.context.fillText('S', this.x+(this.width/2), this.y+this.height, this.width);
				break;
			case 2:
				this.game.context.fillText('M', this.x+(this.width/2), this.y+this.height, this.width);
				break;
			case 3:
				this.game.context.fillText('L', this.x+(this.width/2), this.y+this.height, this.width);
				break;
			case 4:
				this.game.context.fillText('XL', this.x+(this.width/2), this.y+this.height, this.width);
				break;
			case 5:
				this.game.context.fillText('Glue', this.x+(this.width/2), this.y+this.height, this.width);
				break;
			case 6:
				this.game.context.fillText('Gun', this.x+(this.width/2), this.y+this.height, this.width);
				break;
			case 7:
				this.game.context.fillText('Lazer', this.x+(this.width/2), this.y+this.height, this.width);
				break;
			case 8:
				this.game.context.fillText('Doo', this.x+(this.width/2), this.y+this.height, this.width);
				break;
			case 9:
				this.game.context.fillText('Ball', this.x+(this.width/2), this.y+this.height, this.width);
				break;
			}
		},
	remove : function(catched) {
		this.game.goodies.splice(this.game.goodies.indexOf(this),1);
		this.game.play('boing');
		this.clear();
		if(catched)
			{
			switch(this.type)
				{
				case 0:
					this.game.bar.setMode('xs');
					this.game.play('bleep');
					break;
				case 1:
					this.game.bar.setMode('s');
					this.game.play('bleep');
					break;
				case 2:
					this.game.bar.setMode('m');
					this.game.play('bleep');
					break;
				case 3:
					this.game.bar.setMode('l');
					this.game.play('bleep');
					break;
				case 4:
					this.game.bar.setMode('xl');
					this.game.play('bleep');
					break;
				case 5:
					this.game.bar.glueMode=true;
					break;
				case 6:
					if(this.game.bar.fireMode=='Gun')
						this.maxShots++;
					else
						this.game.bar.fireMode='Gun';
					break;
				case 7:
					if(this.game.bar.fireMode=='Lazer')
						this.maxShots++;
					else
						this.game.bar.fireMode='Lazer';
					break;
				case 8:
					this.game.bar.fireMode='';
					this.maxShots=1;
					this.game.bar.glueMode=false;
					this.game.play('fart');
					break;
				case 9:
					this.game.balls.push(new Ball(this.game));
					break;
				}
			}
		},
	move : function(x,y,r) {
		this.clear();
		var nextY=this.y + 0.5*this.speed;
		if(nextY >this.game.height)
			{
			//this.game.play('crash');
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
			this.draw();
			}
		},
	clear : function() {
		this.game.context.clearRect(this.x-1, this.y-1, this.width+2, this.height+2);
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
