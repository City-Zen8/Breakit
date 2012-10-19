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
		// Trying to request animation frame
		this.requestAnimFrame = (function(){
				return  window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||null})();
		this.fit();
		while(element.childNodes[0])
			element.removeChild(element.childNodes[0]);
		if(this.canvas.getContext)
			{
			element.appendChild(this.canvas);
			this.context = this.canvas.getContext('2d');
			this.reset();
			this.initEvents();
			this.initSounds();
			}
		else
			{
			element.appendChild(document.createTextNode('Go buy a real browser !'));
			}
		// Setting defaults
		this._gameOver=false;
		// Requesting the first draw
		if(this.requestAnimFrame)
			this.requestAnimFrame.call(window,this.draw.bind(this));
		},
	reset : function() {
			this._gameOver=false;
			this.context.clearRect(0,0,this.width,this.height);
			this.bar= new Bar(this);
			this.balls=new Array(new Ball(this));
			this.goodies=new Array();
			this.shots=new Array();
			this.level=1;
			this.score=0;
			this.populate();
			this.notice(this.localize('level','Level $',this.level));
			this.resume();
		},
	pause : function() {
		clearTimeout(this.timer);
		this.timer=0;
		},
	resume : function() {
		if(!this.timer)
			this.timer=this.main.delay(30, this);
		},
	resize : function() {
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
		if(!this.bar.lives)
			{
			if(!this._gameOver)
				{
				this.balls=new Array();
				this.notice(this.localize('gameover','Game Over'));
				this._gameOver=true;
				this._gameOverCountdown=1000;
				}
			else if(this._gameOverCountdown<=0)
				this.reset();
			}
		if(!this.bricks.length)
			{
			this.playSound('badadum');
			this.level++;
			this.notice(this.localize('level','Level $',this.level));
			for(var i=this.balls.length-1; i>=0; i--)
				{
				this.balls[i].speed=0;
				}
			while(this.bar.shots[0])
				{
				this.bar.shots[0].remove();
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
			if(this._notice)
				this._noticeDelay--;
			if(this._gameOver)
				this._gameOverCountdown--;
			if(!this.requestAnimFrame)
				this.draw();
			this.timer=this.main.delay(5, this);
			}
		},
	draw: function() {
		if(this.timer)
			{
			// Clearing everything
			this.context.clearRect(0, 0, this.width, this.height);
			// Drawing scores/lives
			//this.context.clearRect(9, 9, this.width, 10*this.aspectRatio);
			this.context.fillStyle = '#000000';
			this.context.font=(10*this.aspectRatio)+'px Arial';
			this.context.textBaseline='top';
			this.context.textAlign='left';
			this.context.fillText(this.localize('lives','$ lives', this.bar.lives),10, 10,300);
			this.context.textAlign='right';
			this.context.fillText(this.localize('score','Score: $', this.score),this.width-10, 10,300);
			// Drawing objects
			for(var i=this.bricks.length-1; i>=0; i--)
				this.bricks[i].draw();
			for(var i=this.goodies.length-1; i>=0; i--)
				this.goodies[i].draw();
			for(var i=this.balls.length-1; i>=0; i--)
				this.balls[i].draw();
			this.bar.draw();
			for(var i=this.bar.shots.length-1; i>=0; i--)
				this.bar.shots[i].draw();
			// Drawing notices
			if(this._notice)
				{
				if(this._noticeDelay>0)
					{
					this.context.fillStyle = '#000000';
					}
				else
					{
					this.context.strokeStyle='#FFFFFF';
					this.context.fillStyle = '#FFFFFF';
					}
				this.context.font=(30*this.aspectRatio)+'px Arial';
				this.context.textAlign='center';
				this.context.textBaseline='middle';
				this.context.fillText(this._notice,this.width/2, this.height/2);
				if(this._noticeDelay<=0)
					{
					this._notice='';
					//this.context.clearRect(0,0,this.width,this.height);
					}
				}
			}
		// Let's go to another draw
		if(this.requestAnimFrame)
			this.requestAnimFrame.call(window,this.draw.bind(this));
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
	initSounds : function() {
		this.muted=false;
		this.sounds=new Array();
		this.registerSound('lazer',this.rootPath+'sounds/77087__supraliminal__laser-short.ogg');
		this.registerSound('boing',this.rootPath+'sounds/88451__davidou__boing.ogg');
		this.registerSound('boing2',this.rootPath+'sounds/48939__itsallhappening__boing.ogg');
		this.registerSound('gunshot',this.rootPath+'sounds/20352__cognito-perceptu__gunshot.ogg');
		this.registerSound('crash',this.rootPath+'sounds/33675__pauliep83__crash.ogg');
		this.registerSound('badadum',this.rootPath+'sounds/37215__simon-lacelle__ba-da-dum.ogg');
		this.registerSound('fart',this.rootPath+'sounds/46985__ifartinurgeneraldirection__toot.ogg');
		this.registerSound('bleep',this.rootPath+'sounds/3062__speedy__bleep.ogg');
		},
	registerSound : function(sound, uri, loop) {
		this.sounds[sound] = new Audio(uri);
		this.sounds[sound].setAttribute('preload','preload');
		if(loop)
			this.sounds[sound].setAttribute('loop','loop');
		},
	playSound : function(sound) {
		if(this.sounds[sound]&&!this.muted)
			{
			//this.sounds[sound].pause();
			//this.sounds[sound].currentTime=0;
			//this.sounds[sound].play();
			this.sounds[sound].cloneNode().play(); // HTTPS : Download the sound each time!!! But could be a way to get multi-channel sound.
			}
		},
	stopSound : function(sound) {
		this.sounds[sound].pause();
		},
	mute : function() {
		this.muted=true;
		},
	/* Events management */
	initEvents : function() {
		this.canvas.addEvent('mousemove',this.moveHandler.bind(this));
		this.canvas.addEvent('click',this.clickHandler.bind(this),true);
		this.canvas.addEvent('contextmenu',this.clickHandler.bind(this),true);
		window.addEvent('keydown',this.keyDownHandler.bind(this),true);
		window.addEvent('keyup',this.keyUpHandler.bind(this),true);
		window.addEventListener('deviceorientation', this.orientationHandler.bind(this), true);
		window.addEventListener('resize', this.resize.bind(this), true);
		},
	removeEvents : function() {
		this.canvas.removeEvents('mousemove');
		this.canvas.removeEvents('click');
		this.canvas.removeEvents('contextmenu');
		window.removeEvents('keydown');
		window.removeEvents('keyup');
		window.removeEvents('deviceorientation');
		window.removeEvents('resize');
		},
	orientationHandler : function(e) {
		var portrait=(window.matchMedia&&window.matchMedia('(orientation: portrait)').matches);
		if((portrait&&e.beta<50)||((!portrait)&&(e.gamma<0&&e.gamma>-50)))
			this.bar.fire();
		if((portrait&&e.gamma<-15)||((!portrait)&&e.beta<-10))
			this.bar.setDirection(-1);
		else if((portrait&&e.gamma>15)||((!portrait)&&e.beta>10))
			this.bar.setDirection(1);
		else
			this.bar.setDirection(0);
		},
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
	/* UI */
	notice : function(message) {
		this._notice=message;
		this._noticeDelay=1000;
		},
	localize : function() {
		return arguments[1].replace('$',arguments[2]);
		},
	/* End */
	close : function() {
		this.pause();
		this.removeEvents();
		},
	destruct : function() {
		}
});
