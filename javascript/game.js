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

var Game=new Class({
	initialize: function(element, rootPath,localizeFunction,noticeFunction)
		{
		// Creating canvas
		this.canvas=document.createElement('canvas');
		this.element=element;
		this.rootPath=(rootPath?rootPath:'');
		if(localizeFunction)
			this.localize=localizeFunction;
		if(noticeFunction)
			this.notice=noticeFunction;
		this.muted=false;
		this.fit();
		while(element.childNodes[0])
			element.removeChild(element.childNodes[0]);
		if(this.canvas.getContext)
			{
			element.appendChild(this.canvas);
			this.context = this.canvas.getContext('2d');
			this.reset();
			this.canvas.addEvent('mousemove',this.moveHandler.bind(this));
			this.canvas.addEvent('click',this.clickHandler.bind(this),true);
			this.canvas.addEvent('contextmenu',this.clickHandler.bind(this),true);
			window.addEvent('keydown',this.keyDownHandler.bind(this),true);
			window.addEvent('keyup',this.keyUpHandler.bind(this),true);
			}
		else
			{
			element.appendChild(document.createTextNode('Go buy a real browser !'));
			}
		this.sounds=new Array();
		this.sounds['lazer'] = new Audio(this.rootPath+'sounds/77087__supraliminal__laser-short.ogg');
		this.sounds['boing'] = new Audio(this.rootPath+'sounds/88451__davidou__boing.ogg');
		this.sounds['boing2'] = new Audio(this.rootPath+'sounds/48939__itsallhappening__boing.ogg');
		this.sounds['gunshot'] = new Audio(this.rootPath+'sounds/20352__cognito-perceptu__gunshot.ogg');
		this.sounds['crash'] = new Audio(this.rootPath+'sounds/33675__pauliep83__crash.ogg');
		this.sounds['badadum'] = new Audio(this.rootPath+'sounds/37215__simon-lacelle__ba-da-dum.ogg');
		this.sounds['fart'] = new Audio(this.rootPath+'sounds/46985__ifartinurgeneraldirection__toot.ogg');
		this.sounds['bleep'] = new Audio(this.rootPath+'sounds/3062__speedy__bleep.ogg');
		},
	reset : function() {
			this.context.clearRect(0,0,this.width,this.height);
			this.bar= new Bar(this);
			this.balls=new Array(new Ball(this));
			this.goodies=new Array();
			this.level=1;
			this.score=0;
			this.populate();
			this.notice(this.localize('level','Level $',this.level));
			if(!this.timer)
				this.timer=this.main.delay(30, this);
		},
	pause : function() {
		console.log('pause');
		clearTimeout(this.timer);
		this.timer=0;
		},
	resume : function() {
		console.log('resume');
		if(!this.timer)
			this.timer=this.main.delay(30, this);
		},
	mute : function() {
		this.muted=true;
		},
	resize : function() {
		console.log('resize');
		this.fit();
		for(var i=this.balls.length-1; i>=0; i--)
			{
			this.balls[i].speed=0;
			this.balls[i].fit();
			}
		this.bar.fit();
		this.populate();
		},
	fit : function() {
		var size=this.element.getSize();
		this.width=size.x;
		this.height=size.y;
		this.canvas.width=this.width;
		this.canvas.height=this.height;
		this.canvas.setStyle('display','block');
		this.aspectRatio=this.height/200;
		},
	main : function() {
		this.context.clearRect(9, 9, this.width, 10*this.aspectRatio);
		this.context.fillStyle = '#000000';
		this.context.font=(10*this.aspectRatio)+'px Arial';
		this.context.textBaseline='top';
		this.context.textAlign='left';
		this.context.fillText(this.localize('lives','$ lives', this.bar.lives),10, 10,300);
		this.context.textAlign='right';
		this.context.fillText(this.localize('score','Score: $', this.score),this.width-10, 10,300);
		if(!this.bar.lives)
			{
			clearTimeout(this.timer);
			this.timer=0;
			this.balls=new Array();
			this.context.fillStyle = '#000000';
			this.context.font=(30*this.aspectRatio)+'px Arial';
			this.context.textAlign='center';
			this.context.textBaseline='middle';
			this.context.fillText(this.localize('gameover','Game Over'),this.width/2, this.height/2);
			}
		else if(!this.bricks.length)
			{
			this.play('badadum');
			this.level++;
			this.notice(this.localize('level','Level $',this.level));
			for(var i=this.balls.length-1; i>=0; i--)
				{
				this.balls[i].speed=0;
				}
			while(this.bar.shots[0])
				{
				this.bar.shots[0].clear();
				}
			this.populate();
			}
		if(this.timer)
			{
			this.bar.move();
			for(var i=this.bar.shots.length-1; i>=0; i--)
				this.bar.shots[i].move();
			for(var i=this.balls.length-1; i>=0; i--)
				this.balls[i].move();
			for(var i=this.goodies.length-1; i>=0; i--)
				this.goodies[i].move();
			for(var i=this.bricks.length-1; i>=0; i--)
				this.bricks[i].draw();
			for(var i=this.goodies.length-1; i>=0; i--)
				this.goodies[i].draw();
			for(var i=this.balls.length-1; i>=0; i--)
				this.balls[i].draw();
			this.bar.draw();
			for(var i=this.bar.shots.length-1; i>=0; i--)
				this.bar.shots[i].draw();
			this.timer=this.main.delay(5, this);
			}
		},
	populate : function() {
		var bHeight=10*this.aspectRatio, bWidth=30*this.aspectRatio, bMargin=2,
			gXMargin=20*this.aspectRatio, gYMargin=20*this.aspectRatio;
		bXDecal=Math.floor(((this.width-(gXMargin*2))%(bWidth+bMargin))/2),
		bYDecal=Math.floor((((this.height/2)-(gYMargin*2))%(bHeight+bMargin))/2),
		this.bricks=new Array();
		for(var i=0, j=Math.floor((this.width-(gXMargin*2))/(bWidth+bMargin)); i<j; i++)
			{
			for(var k=0, l=Math.floor(((this.height/2)-(gYMargin))/(bHeight+bMargin)); k<l; k++)
				{
				this.bricks.push(new Brick(this,gXMargin+bXDecal+i*bWidth+bMargin*(i-1),
					gYMargin+bYDecal+k*bHeight+bMargin*(k-1),bWidth,bHeight));
				}
			}
		},
	/* Sound management */
	play : function(sound) {
		if(!this.muted)
			{
			this.sounds[sound].pause();
			this.sounds[sound].currentTime=0;
			this.sounds[sound].play();
			//this.sounds[sound].cloneNode().play(); Download the sound each time!!!
			}
		},
	/* Events management */
	moveHandler : function(e) {
		var x=e.page.x-this.canvas.getPosition().x-(this.bar.width/2);
		this.bar.moveTo(x);
		},
	clickHandler : function(e) {
		if(e.rightClick)
			{
			this.bar.fire();
			}
		else
			{
			for(var i=this.balls.length-1; i>=0; i--)
				{
				if(!this.balls[i].speed)
					{
					this.balls[i].start();
					break;
					}
				}
			}
		e.stop();
		},
	keyDownHandler : function(e) {
		var used=true;
		switch(e.key)
			{
			case 'left':
				this.bar.setDirection(-1);
				break;
			case 'right':
				this.bar.setDirection(1);
				break;
			default:
				used=false;
				break;
			}
		if(used)
			e.stop();
		},
	keyUpHandler : function(e) {
		var used=true;
		switch(e.key)
			{
			case 'space':
				this.bar.fire();
				break;
			case 'left':
			case 'right':
				this.bar.setDirection(0);
				break;
			case 'up':
				for(var i=this.balls.length-1; i>=0; i--)
					{
					if(!this.balls[i].speed)
						{
						this.balls[i].start();
						break;
						}
					}
				break;
			default:
				used=false;
				break;
			}
		if(used)
			e.stop();
		},
	/* End */
	close : function() {
		if(this.timer)
			clearTimeout(this.timer);
		this.canvas.removeEvents('mousemove');
		this.canvas.removeEvents('click');
		window.removeEvents('keydown');
		},
	notice : function(message) {
			//alert(message);
		},
	localize : function() {
		return arguments[1];
		},
	destruct : function() {
		alert('x');
		}
});
