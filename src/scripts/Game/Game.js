const Asteroid = require('./Asteroid');
const Spaceship = require('./Spaceship');
const Bullet = require('./Bullet');
const Scoreboard = require('./Scoreboard');

const defaultGameOpts = {
	tickLength: 50, // ms time in between frames
	numTicksBeforePausing: 5,
	maxAsteroids: 1,
	maxChildAsteroids: 2,
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

	this.lastRender = window.performance.now();

	// Game Status:
	this.isActive = true; // whether the game is active or not
	this.scoreboard;

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

	// initialize the scoreboard object
	this.scoreboard = new Scoreboard();
	this.scoreboard.init();

	// Initialize factory for making spaceship & asteroid:
	this.makeSpaceship = this.initMakeSpaceship();
	this.makeAsteroid = this.initMakeAsteroid();

	// Create spaceship:
	this.spaceship = this.makeSpaceship(true);

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
	}
	// CASE: enough time has passed since last render & time to update by ticks
	const timeSinceTick = timeStamp - lastRender;
	numTicks = Math.floor(timeSinceTick / tickLength);
	this.lastRender = timeStamp;

	// note: assume a large numTicks means user switched tab && we're pausing state:
	if (numTicks > this.options.numTicksBeforePausing) return;

	// Create additional asteroids etc. (if possible)
	this.makeAsteroid();

	this.fireBullet();

	// GAME LOGIC HERE:
	// i) calculate points of all objects
	this.calcAllPoints(numTicks);

	// TODO:
	// ii) look for collisions asteroids w./ spaceship && asteroid w./ bullets
	this.processCollisions();

	// iii) render the updated points & objects:
	this.paintAllFrames(numTicks, timeStamp);
};

Game.prototype.calcAllPoints = function calcAllPoints(numTicks) {
	// TODO: after I used typescript & abstract out function constructors, make this more general?
	if (this.spaceship) {
		this.spaceship.calcPoints(numTicks);
	}

	// Calculate new points for all items:
	this.asteroids.forEach(asteroid => {
		if (asteroid.isActive) {
			asteroid.calcPoints(numTicks);
		}
	});

	this.bullets = this.bullets.filter(bullet => {
		if (!bullet.isActive) {
			return false;
		}
		return bullet.calcPoints();
	});
};

Game.prototype.processCollisions = function() {
	const bullets = this.bullets;

	// Check asteroids and bullet collisions
	let newAsteroids = [];
	this.asteroids = this.asteroids.filter(asteroid => {
		// loop through each bullet & check if asteroid contains that bullet
		for (let i = 0; i < bullets.length; i++) {
			const bulletPt = bullets[i].origin;

			// Case: bullet --> asteroid (hit)
			if (asteroid.containsPoint(bulletPt)) {
				this.scoreboard.addScore(asteroid.options.scoreValue || 1);

				asteroid.destroy();

				const childAsteroids = Asteroid.createFromParent(asteroid);

				if (childAsteroids.length !== 0) {
					newAsteroids = newAsteroids.concat(childAsteroids);
				}
				bullets[i].isActive = false;
			}
		}

		return asteroid.isActive;
	});
	this.asteroids = this.asteroids.concat(newAsteroids);

	// check asteroid & ship collisions
	if (this.spaceship && this.spaceship.isActive) {
		for (let i = 0; i < this.asteroids.length; i++) {
			const asteroid = this.asteroids[i];

			for (let j = 0; j < this.spaceship.currPoints.length; j++) {
				const givenPoint = this.spaceship.currPoints[j];
				if (asteroid.containsPoint(givenPoint)) {
					this.spaceship.onDestroy();
					this.spaceship = null;

					this.makeSpaceship();

					// TODO: trigger a spaceship event of an explosion
					return;
				}
			}
		}
	}
};

Game.prototype.paintAllFrames = function paintFrame() {
	// Clear the box:
	this.ctx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);

	// Draw new points for all items:
	if (this.spaceship) {
		this.spaceship.drawPoints();
	}

	this.asteroids.forEach(asteroid => {
		if (asteroid.isActive) {
			asteroid.drawPoints();
		}
	});

	this.bullets.forEach(bullet => {
		if (bullet.isActive) {
			bullet.drawPoints(); // drawPoints also checks if its Active, dont know where it would be better
		}
	});
};

Game.prototype.initMakeSpaceship = function initMakeSpaceship() {
	let timeout;

	return function makeSpaceship(blnMakeNow = false) {
		// check if there are enough lives:
		if (this.scoreboard.lives === 0) {
			this.isActive = false;
			console.log('GAME OVER!!!!');
		} else {
			// Can make spaceship
			if (!timeout && !blnMakeNow) {
				this.scoreboard.setLife('-1');
				setTimeout(() => {
					timeout = null;
					this.spaceship = new Spaceship(this);
				}, 1000);
				return null;
			}
			this.scoreboard.setLife('-1');
			return new Spaceship(this);
		}
	};
};

// TODO: refactor, make asteroids & do it in waves?
Game.prototype.initMakeAsteroid = function initMakeAsteroid() {
	let timerRef = null;
	let canMakeAsteroid = true;

	// Save the Game Obj as a static property on the Asteroid class
	Asteroid.gameRef = this;

	return function makeAsteroid(blnForce = false, options = {}) {
		if (blnForce) {
			this.asteroids.push(new Asteroid(options));
		} else if (this.asteroids.length < this.options.maxAsteroids) {
			if (canMakeAsteroid) {
				this.asteroids.push(new Asteroid());
				canMakeAsteroid = false;
			} else if (timerRef === null) {
				timerRef = setTimeout(() => {
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
			const origin = this.spaceship.currPoints[0];
			const offSet = this.spaceship.offSet;
			this.bullets.push(new Bullet(this, origin, offSet));
			this.canFire = false;
			setTimeout(() => {
				this.canFire = true;
			}, defaultGameOpts.firingDelay);
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
