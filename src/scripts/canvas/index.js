'use strict';

const Asteroid = require('./Asteroid');
const Spaceship = require('./Spaceship');

const defaultGameOpts = {
	tickLength: 50, // ms time in between frames
	numTicksBeforePausing: 5,
	maxAsteroids: 5,
};

function Game(opts) {
	// Static Properties
	this.options = defaultGameOpts || opts;
	this.canvasElem = this.getCanvasElement();
	this.ctx;

	// Dynamic Properties
	this.asteroids = Array.apply(null, Array(this.options.maxAsteroids)).map(
		() => null
	);
	this.spaceship;

	this.lastTick = window.performance.now();
	this.lastRender = this.lastTick;

	this.init();
}

Game.prototype.repaint = function repaint(numTicks) {
	// console.log(numTicks);

	// TEMP: assuming you switch tab or pause:
	if (numTicks > this.options.numTicksBeforePausing) return;

	// Clear the box:
	this.ctx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);

	// TESTING PURPOSE: add one asteroid here

	if (!this.spaceship) {
		this.spaceship = new Spaceship(this);
	} else {
		this.spaceship.repaint(numTicks);
	}

	// CHeck if there are any asteroids
	// loop through the asteroids
	this.asteroids.forEach(function(asteroid) {
		if (asteroid) {
			asteroid.draw(numTicks);
		}
	});
};

// ================= Game related events ================
Game.prototype.emitEvent = function(event) {
	switch (event) {
	case 'throttle-on':
		this.spaceship.throttleOn();
		break;
	case 'throttle-off':
		this.spaceship.throttleOff();
		break;
	case 'ArrowRight':
		console.log('rotate right');
		this.spaceship.offSet += 10;
		// this.spaceship.move();
		break;
	case 'ArrowLeft':
		console.log('rotate left');
		this.spaceship.offSet -= 10;
		break;
	default:
		console.warn(`Could not process ${event}`);
	}
};

// ================= initialization & Main thread ===============
Game.prototype.loop = function loop(timeStamp) {
	// RequestAnimationFrame as first line, good practice as per se MDN
	window.requestAnimationFrame(this.loop.bind(this));

	const lastRender = this.lastRender;
	const { tickLength } = this.options;
	const nextTick = lastRender + tickLength;
	let numTicks;

	if (timeStamp < nextTick) {
		// CASE: too early for the next frame, avoid layout thrashing
		return false;
	} else {
		// CASE: enough time has passed since last render & time to update by ticks
		let timeSinceTick = timeStamp - lastRender;
		numTicks = Math.floor(timeSinceTick / tickLength);
		this.lastRender = timeStamp;
	}

	// II) Repaint && Update
	this.repaint(numTicks, timeStamp);
};

Game.prototype.init = function init() {
	if (!this.canvasElem) {
		console.warn('No Canvas Element');
		return;
	}

	// Set context to be 2D
	this.ctx = this.canvasElem.getContext('2d');

	window.requestAnimationFrame(this.loop.bind(this));

	this.asteroids.map(
		function() {
			return new Promise(function(resolve, reject) {
				let time = Math.random() * 1000;
				setTimeout(
					function() {
						console.log('created new asteroid');
						resolve(new Asteroid(this));
					}.bind(this),
					time
				);
			});
		}.bind(this)
	);
};

//#region getCanvasElement
Game.prototype.getCanvasElement = function getCanvasElement() {
	const bgCanvas = document.getElementById('bg-canvas');

	// Check for compatibility:
	if (!bgCanvas) {
		return false;
	} else if (!bgCanvas.getContext) {
		console.warn('canvas getContext not supported!');
		return false;
	}

	// Resize canvas:
	bgCanvas.width = window.innerWidth;
	bgCanvas.height = window.innerHeight;

	return bgCanvas;
};
//#endregion

module.exports = exports = Game;
