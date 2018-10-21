'use strict';

const Asteroid = require('./Asteroid');
const Spaceship = require('./Spaceship');
const Bullet = require('./Bullet');

const defaultGameOpts = {
	tickLength: 50, // ms time in between frames
	numTicksBeforePausing: 5,
	maxAsteroids: 5,
	asteroidDelay: 3 * 1000,
	firingDelay: 200
};

function Game(opts) {
	// Static Properties
	this.options = defaultGameOpts || opts;
	this.canvasElem;
	this.ctx;

	// Dynamic Properties
	this.bullets = [];
	this.spaceship;
	this.asteroids = [];
	this.isFiring = false;
	this.canFire = true;

	this.isActive = true; // whether the game is active or not
	this.lastRender = window.performance.now();

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
	// this.asteroids[0] = new Asteroid(this);
	this.makeAsteroid = this.initMakeAsteroid();

	// Start looping of our game:
	window.requestAnimationFrame(this.loop.bind(this));
};

// ============ main loop of game ===========
Game.prototype.loop = function loop(timeStamp = this.lastRender) {
	if (!this.isActive) return;

	// RequestAnimationFrame as first line, good practice as per se MDN
	window.requestAnimationFrame(this.loop.bind(this));

	// Determine numTicks & if enough time has passed to proceed:
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

	// note: assume a large numTicks means user switched tab && we're pausing state:
	if (numTicks > this.options.numTicksBeforePausing) return;

	// Create additional asteroids etc. (if possible)
	this.makeAsteroid();

	this.fireBullet();

	// GAME LOGIC HERE:
	// i) calculate points of all objects
	this.calcAllPoints(numTicks);

	//TODO:
	// ii) look for collisions asteroids w./ spaceship && asteroid w./ bullets
	this.processCollisions();

	// iii) render the updated points & objects:
	this.paintAllFrames(numTicks, timeStamp);
};

Game.prototype.calcAllPoints = function calcAllPoints(numTicks) {
	// Calculate new points for all items:
	this.spaceship.calcPoints(numTicks);
	this.asteroids.forEach(asteroid => {
		asteroid.calcPoints(numTicks);
	});
	this.bullets = this.bullets.filter(bullet => {
		if (!bullet.isActive) {
			return false;
		} else {
			return bullet.calcPoints();
		}
	});
};

Game.prototype.processCollisions = function() {
	let bullets = this.bullets;
	this.asteroids = this.asteroids.filter(asteroid => {
		// loop through each bullet & check if asteroid contains that bullet
		for (let i = 0; i < bullets.length; i++) {
			let bulletPt = bullets[i].origin;
			if (asteroid.containsPoint(bulletPt)) {
				console.log('Hit the asteroid!!!');
				asteroid.isActive = false;
				bullets[i].isActive = false;
			}
		}

		return asteroid.isActive;
	});
};

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
	this.bullets.forEach(bullet => {
		if (bullet.isActive) {
			bullet.drawPoints(); // drawPoints also checks if its Active, dont know where it would be better
		}
	});
};

Game.prototype.initMakeAsteroid = function initMakeAsteroid() {
	let timerRef = null;
	let canMakeAsteroid = true;
	return function makeAsteroid() {
		if (this.asteroids.length < this.options.maxAsteroids) {
			if (canMakeAsteroid) {
				this.asteroids.push(new Asteroid(this));
				canMakeAsteroid = false;
			} else if (timerRef === null) {
				timerRef = setTimeout(function() {
					console.log('resetting timeout');
					timerRef = null;
					canMakeAsteroid = true;
				}, this.options.asteroidDelay);
			}
		}
	};
};

Game.prototype.fireBullet = function fireBullet() {
	if (this.isFiring) {
		if (this.canFire) {
			var origin = this.spaceship.currPoints[0];
			var offSet = this.spaceship.offSet;
			this.bullets.push(new Bullet(this, origin, offSet));
			this.canFire = false;
			setTimeout(function(){
				this.canFire = true;
			}.bind(this), defaultGameOpts.firingDelay);
		} 
	}
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
	case 'fire-on':
		this.isFiring = true;
		break;
	case 'fire-off':
		this.isFiring = false;
		console.log('stop firing');
		break;
	case 'toggle-pause':
		this.isActive = !this.isActive;
		if (this.isActive) {
			this.loop();
		}
		break;
	default:
		console.warn(`Could not process ${event}`);
	}
};

module.exports = exports = Game;
