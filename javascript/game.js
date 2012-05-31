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
	initialize: function(element, rootPath,noticeFunction)
		{
		// Creating canvas
		this.canvas=document.createElement('canvas');
		this.element=element;
		this.rootPath=(rootPath?rootPath:'');
		if(noticeFunction)
			this.notice=noticeFunction;
		this.fit();
		while(element.childNodes[0])
			element.removeChild(element.childNodes[0]);
		if(this.canvas.getContext)
			{
			element.appendChild(this.canvas);
			this.context = this.canvas.getContext('2d');
			this.bar= new Bar(this);
			this.canvas.addEvent('mousemove',this.bar.move.bind(this.bar));
			this.balls=new Array(new Ball(this));
			this.goodies=new Array();
			this.level=1;
			this.populate();
			this.notice('level',this.level);
			this.timer=this.main.delay(30, this);
			this.canvas.addEvent('click',this.clickHandler.bind(this),true);
			this.canvas.addEvent('contextmenu',this.clickHandler.bind(this),true);
			window.addEvent('keydown',this.keyHandler.bind(this),true);
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
		if(!this.bricks.length)
			{
			this.play('badadum');
			this.level++;
			this.notice('level',this.level);
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
			this.bar.remove();
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
			gXMargin=10*this.aspectRatio, gYMargin=10*this.aspectRatio;
		bXDecal=Math.floor(((this.width-(gXMargin*2))%(bWidth+bMargin))/2),
		bYDecal=Math.floor((((this.height/2)-(gYMargin*2))%(bHeight+bMargin))/2),
		this.bricks=new Array();
		for(var i=0, j=Math.floor((this.width-(gXMargin*2))/(bWidth+bMargin)); i<j; i++)
			{
			//this.bricks[i]=array(); Could improve hit test by checking lines hit first
			for(var k=0, l=Math.floor(((this.height/2)-(gYMargin*2))/(bHeight+bMargin)); k<l; k++)
				{
				this.bricks.push(new Brick(this,gXMargin+bXDecal+i*bWidth+bMargin*(i-1),
					gYMargin+bYDecal+k*bHeight+bMargin*(k-1),bWidth,bHeight));
				}
			}
		},
	/* Sound management */
	play : function(sound) {
		this.sounds[sound].pause();
		this.sounds[sound].currentTime=0;
		this.sounds[sound].play();
		//this.sounds[sound].cloneNode().play();
		},
	/* Events management */
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
	keyHandler : function(e) {
		var used=true;
		switch(e.key)
			{
			case 'space':
				this.bar.fire();
				break;
			case 'left':
				this.bar.go(false);
				break;
			case 'right':
				this.bar.go(true);
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
	notice : function() {
		},
	destruct : function() {
		alert('x');
		}
});
