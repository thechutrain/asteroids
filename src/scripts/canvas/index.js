'use strict';

const Asteroid = require('./Asteroid');

let prevTime = window.performance.now();
let frameTime = 30;

const defaultGameOpts = {
	tickLength: 10, // ms time in between frames
};

function Game(opts) {
	// Static Properties
	this.options = defaultGameOpts || opts;
	this.canvasElem = this.getCanvasElement();
	this.ctx;

	// Dynamic Properties
	this.asteroids = [];
	this.lastTick = window.performance.now();
	this.lastRender = this.lastTick;

	this.init();
}

Game.prototype.repaint = function repaint(numTicks) {
	// console.log(numTicks);

	// TEMP: assuming you switch tab or pause:
	if (numTicks > 5) return;

	// Clear the box:
	this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

	// CHeck if there are any asteroids
	if (!this.asteroids.length) {
		let asteroid = new Asteroid(this);
		this.asteroids.push(asteroid);
	} else {
		// loop through the asteroids
		this.asteroids.forEach(function(asteroid) {
			asteroid.draw(numTicks);
		});
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
	this.repaint(numTicks);
};

Game.prototype.init = function init() {
	if (!this.canvasElem) {
		console.warn('No Canvas Element');
		return;
	}

	// Set context to be 2D
	this.ctx = this.canvasElem.getContext('2d');

	window.requestAnimationFrame(this.loop.bind(this));
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
