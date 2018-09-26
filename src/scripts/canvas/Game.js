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
	this.canvasElem;
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
	// Get the canvas DOM element:
	this.canvasElem = document.getElementById('bg-canvas');
	if (!this.canvasElem) {
		console.warn('No canvas element on page');
		return;
	}

	// Set canvas size & context:
	this.canvasElem.width = window.innerWidth;
	this.canvasElem.height = window.innerHeight;
	this.ctx = this.canvasElem.getContext('2d');

	// Create spaceship:
	this.spaceship = new Spaceship(this);

	// Create the asteroids:
	this.asteroids[0] = new Asteroid(this);

	// Start looping of our game:
	window.requestAnimationFrame(this.loop.bind(this));
};

/** ============ main loop of game ===========
 *
 *
 */
Game.prototype.loop = function loop(timeStamp) {
	// RequestAnimationFrame as first line, good practice as per se MDN
	window.requestAnimationFrame(this.loop.bind(this));

	const lastRender = this.lastRender;
	const tickLength = this.options.tickLength;
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

	// TEMP: assume a large numTicks means user switched tab && we're pausing state:
	if (numTicks > this.options.numTicksBeforePausing) return;

	// GAME LOGIC HERE:
	// i) calculate points of all objects
	// ii) look for collisions asteroids w./ spaceship && asteroid w./ bullets
	// iii) render the updated points & objects:
	this.calcAllPoints(numTicks);
	this.processCollisions();
	this.paintAllFrames(numTicks, timeStamp);
};

Game.prototype.calcAllPoints = function calcAllPoints(numTicks) {
	// Calculate new points for all items:
	this.spaceship.calcPoints(numTicks);
	this.asteroids.forEach(asteroid => {
		if (asteroid) {
			asteroid.calcPoints(numTicks);
		}
	});
};

Game.prototype.processCollisions = function() {};

Game.prototype.paintAllFrames = function paintFrame() {
	// Clear the box:
	this.ctx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);

	// Draw new points for all items:
	this.spaceship.drawPoints();
	this.asteroids.forEach(asteroid => {
		if (asteroid) {
			asteroid.drawPoints();
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

// ============= Utility functions ============

module.exports = exports = Game;
