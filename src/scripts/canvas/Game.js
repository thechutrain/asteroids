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
	this.canvasElem = this._getCanvasElement();
	this.ctx;

	// Dynamic Properties
	this.spaceship;
	this.asteroids = Array.apply(null, Array(this.options.maxAsteroids)).map(
		() => null
	);

	this.lastTick = window.performance.now();
	this.lastRender = this.lastTick;

	this.init();
}

Game.prototype.init = function init() {
	if (!this.canvasElem) {
		console.warn('No Canvas Element');
		return false;
	} else {
		this.ctx = this.canvasElem.getContext('2d');
	}

	// Create spaceship:
	this.spaceship = new Spaceship(this);

	// Create the asteroids:
	this.asteroids[0] = new Asteroid(this);

	// Create the spaceship:

	// Start looping of our game:
	window.requestAnimationFrame(this.loop.bind(this));
};

Game.prototype.paintFrame = function paintFrame(numTicks) {
	// console.log(numTicks);

	// TEMP: assuming you switch tab or pause:
	if (numTicks > this.options.numTicksBeforePausing) return;

	// Calculate new points for all items:
	this.spaceship.calcPoints(numTicks);
	this.asteroids.forEach(asteroid => {
		if (asteroid) {
			asteroid.calcPoints(numTicks);
		}
	});

	// Clear the box:
	this.ctx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);

	// Draw new points for all items:
	this.spaceship.drawPoints();
	this.asteroids.forEach(asteroid => {
		if (asteroid) {
			asteroid.drawPoints();
		}
	});

	// PREVIOUS VERSION:
	// if (!this.spaceship) {
	// 	this.spaceship = new Spaceship(this);
	// } else {
	// 	this.spaceship.paintFrame(numTicks);
	// }

	// // CHeck if there are any asteroids
	// // loop through the asteroids
	// this.asteroids.forEach(function(asteroid) {
	// 	if (asteroid) {
	// 		asteroid.draw(numTicks);
	// 	}
	// });
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
	case 'right-on':
		this.spaceship.turnRight = true;
		break;
	case 'right-off':
		this.spaceship.turnRight = false;
		break;
	case 'left-on':
		this.spaceship.turnLeft = true;
		break;
	case 'left-off':
		this.spaceship.turnLeft = false;
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

	// II) paintFrame && Update
	this.paintFrame(numTicks, timeStamp);
};

// ============= Utility functions ============
//#region getCanvasElement
Game.prototype._getCanvasElement = function getCanvasElement() {
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
