/**
 * NOTE: Asteroid class requires a gameRef (canvasElem & ctx) in order to render correctly
 */

const Utils = require('../utils');

const defaultOpts = {
	color: 'rgba(48, 128, 232, 0.6)',
	animate: true,
	spacer: 1, // additional padding space added when calculating off frame reset
	level: 1,
	scoreValue: 5
};

class Asteroid {
	constructor(options = {}) {
		this.options = Utils.extend(defaultOpts, options);

		this.origin = options.origin ? options.origin : {};
		this.r = options.r || 45;
		this.offSet = options.offSet || 0;
		this.translateX = options.translateX || getRandomSpeed('x');
		this.translateY = options.translateY || getRandomSpeed('y');

		// Derived Properties:
		this.prevPoints = [];
		this.currPoints = [];
		this.onScreen = true; // when true, means at least one point is on the canvas
		this.isActive = true; // determines if its been hit or not

		this.init();
	}

	/**
	 * initializer function
	 */
	init() {
		// If provided with an origin, don't randomly create another one
		if (this.origin.hasOwnProperty('x') && this.origin.hasOwnProperty('y')) {
			return;
		}

		// Default: no origin, determin which quadrant offscreen to originate from:
		let quadrant;
		if (this.translateX > 0) {
			quadrant = this.translateY > 0 ? 2 : 3;
		} else {
			quadrant = this.translateY > 0 ? 1 : 4;
		}

		const width = Asteroid.gameRef.canvasElem.width;
		const height = Asteroid.gameRef.canvasElem.height;

		switch (quadrant) {
			case 1:
				this.origin = {
					x: width + 10,
					y: -10
				};
				break;
			case 2:
				this.origin = {
					x: -10,
					y: -10
				};
				break;
			case 3:
				this.origin = {
					x: -10,
					y: height + 10
				};
				break;
			case 4:
				this.origin = {
					x: width + 10,
					y: height + 10
				};
				break;
		}
	}

	/** Main Functions:
	 * calcPoints()
	 * drawPoints()
	 * reframe()
	 */
	calcPoints(ticks) {
		const { translateX, translateY } = this;
		const moveXBy = ticks * translateX;
		const moveYBy = ticks * translateY;

		this.origin.x = this.origin.x + moveXBy;
		this.origin.y = this.origin.y + moveYBy;

		this.offSet += 2;

		this.prevPoints = this.currPoints;
		this.currPoints = [];
		// TODO: make sides an option
		const sides = 8;
		const angleUnit = 360 / sides;
		for (let i = 0; i < sides; i++) {
			const angle = angleUnit * i + this.offSet;
			const newX = this.origin.x + Math.sin((Math.PI * angle) / 180) * this.r;
			const newY = this.origin.y + Math.cos((Math.PI * angle) / 180) * this.r;
			this.currPoints.push({
				x: newX,
				y: newY
			});
		}

		if (!this.onScreen && this.isVisible()) {
			this.onScreen = true;
		} else if (this.isHidden()) {
			this.onScreen = false;
			this.reframe();
		}
	}

	drawPoints() {
		const ctx = Asteroid.gameRef.ctx;
		const { color } = this.options;

		ctx.save();
		ctx.fillStyle = color;
		ctx.beginPath();
		this.currPoints.forEach((pt, i) => {
			// Draw points:
			if (i === 0) {
				ctx.moveTo(pt.x, pt.y);
			} else {
				ctx.lineTo(pt.x, pt.y);
			}
		});
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}

	reframe() {
		const xLimit = Asteroid.gameRef.canvasElem.width;
		const yLimit = Asteroid.gameRef.canvasElem.height;
		let adjustXBy = 0;
		let adjustYBy = 0;

		// Determine left, right, top, bottom bounds of our shape:
		const { leftBound, rightBound, upperBound, lowerBound } = this.getBounds();

		// ===== ADJUST X-coordinates =====
		// CASE: moving right
		if (this.translateX > 0) {
			// Check to see if the trailing edge (far left x-coord on shape) is off screen
			if (leftBound > xLimit) {
				// then adjust all the x-coordinates
				adjustXBy = -1 * (rightBound + this.options.spacer);
			}
		} else {
			// CASE: moving left
			// checkt to see if shape may be off the canvas on the left-side
			if (rightBound < 0) {
				// all x-coordinates are off the screen & we need to update
				adjustXBy = Math.abs(leftBound) + xLimit + this.options.spacer;
			}
		}

		// ===== ADJUST Y-coordinates =====
		// CASE: moving down
		if (this.translateY > 0) {
			// Case: moving down, could potentially be below canvas
			if (upperBound > yLimit) {
				adjustYBy = -1 * (lowerBound + this.options.spacer);
			}
		} else {
			// Case; moving up
			// check if the entire shape is above the canvas
			if (lowerBound < 0) {
				adjustYBy = Math.abs(upperBound) + yLimit + this.options.spacer;
			}
		}

		this.origin.x = this.origin.x + adjustXBy;
		this.origin.y = this.origin.y + adjustYBy;

		this.currPoints.forEach(pt => {
			pt.x += adjustXBy;
			pt.y += adjustYBy;
		});
	}

	/** Destroys current asteroid and returns smaller asteroids if possible */
	destroy() {
		this.isActive = false;
	}

	// ========= Visibility utility functions ==========
	isPartiallyVisible() {
		return !this.isVisible() && !this.isHidden();
	}

	isVisible() {
		const xLimit = Asteroid.gameRef.canvasElem.width;
		const yLimit = Asteroid.gameRef.canvasElem.height;
		// let isVisible = false;

		return this.currPoints.every(pt => {
			const { x, y } = pt;
			return x >= 0 && x <= xLimit && y >= 0 && y <= yLimit;
		});
	}

	isHidden() {
		const xLimit = Asteroid.gameRef.canvasElem.width;
		const yLimit = Asteroid.gameRef.canvasElem.height;

		return this.currPoints.every(pt => {
			const { x, y } = pt;
			return x < 0 || x > xLimit || y < 0 || y > yLimit;
		});
	}

	getBounds() {
		let leftBound;
		let rightBound;
		let upperBound;
		let lowerBound;
		this.currPoints.forEach((pt, i) => {
			const { x, y } = pt;
			// Set default:
			if (i === 0) {
				leftBound = rightBound = x;
				upperBound = lowerBound = y;
			} else {
				leftBound = Math.min(leftBound, x);
				rightBound = Math.max(rightBound, x);
				upperBound = Math.min(upperBound, y);
				lowerBound = Math.max(lowerBound, y);
			}
		});

		return {
			leftBound,
			rightBound,
			upperBound,
			lowerBound
		};
	}

	containsPoint(ptCoord) {
		if (!this.currPoints.length) return false;

		const { leftBound, rightBound, upperBound, lowerBound } = getBounds(
			this.currPoints
		);

		// Make sure the pt of interest is contained within its bounds:
		// TODO: should save this as a property of the asteroids object, instead of recalculating?? cache value
		if (
			ptCoord.x < leftBound ||
			ptCoord.x > rightBound ||
			ptCoord.y < upperBound ||
			ptCoord.y > lowerBound
		) {
			return false;
		}

		let isOnLine = false; // bln flag to check if its on the line, then containsPoints ==> true!
		const lineResults = this.currPoints.map((pt1, index, coordArr) => {
			const x1 = pt1.x;
			const y1 = pt1.y;
			const x2 =
				index + 1 < coordArr.length ? coordArr[index + 1].x : coordArr[0].x;
			const y2 =
				index + 1 < coordArr.length ? coordArr[index + 1].y : coordArr[0].y;
			const m = (y1 - y2) / (x1 - x2);
			const b = y1 - m * x1;

			// Edge Case: slope is a vertical line
			if (m === Infinity) {
				if (ptCoord.x === x1) {
					isOnLine = true;
					return true; // this really doesn't matter
				}
				return ptCoord.x < x1;
			}
			if (ptCoord.y === m * ptCoord.x + b) {
				isOnLine = true;
				return true; // this really doesn't matter
			}
			return ptCoord.y < m * ptCoord.x + b;
		});

		if (isOnLine) {
			return true;
		}
		// check how many lines it was below
		let numLinesBelow = 0;
		const shouldEqual = Math.ceil(lineResults.length / 2);
		lineResults.forEach(res => {
			if (res) {
				numLinesBelow++;
			}
		});

		return numLinesBelow === shouldEqual;

		// Refactor so its more general?
		function getBounds(coordArr) {
			let leftBound;
			let rightBound;
			let upperBound;
			let lowerBound;
			coordArr.forEach((pt, i) => {
				const { x, y } = pt;
				if (i === 0) {
					// Sets default values
					leftBound = rightBound = x;
					upperBound = lowerBound = y;
				} else {
					leftBound = Math.min(leftBound, x);
					rightBound = Math.max(rightBound, x);
					upperBound = Math.min(upperBound, y);
					lowerBound = Math.max(lowerBound, y);
				}
			});
			return {
				leftBound,
				rightBound,
				upperBound,
				lowerBound
			};
		}
	}
}

Asteroid.createFromParent = function(parentAsteroid) {
	const childAsteroids = [];
	const level = parentAsteroid.options.level + 1;
	const MAX_LEVEL = Asteroid.gameRef.options.maxChildAsteroids;

	if (level > MAX_LEVEL) return [];

	const speedX = getRandomSpeed('x');
	const speedY = getRandomSpeed('y');
	const r = Math.floor(parentAsteroid.r / 2);
	const scoreValue = parentAsteroid.options.scoreValue * 2;

	childAsteroids.push(
		new Asteroid({
			translateX: speedX,
			translateY: speedY,
			origin: Utils.clone(parentAsteroid.origin),
			level,
			r,
			scoreValue
		})
	);

	childAsteroids.push(
		new Asteroid({
			translateX: -1 * speedX,
			translateY: -1 * speedY,
			origin: Utils.clone(parentAsteroid.origin),
			level,
			r,
			scoreValue
		})
	);

	return childAsteroids;
};

// ================ HELPER FUNCTION ============
function getRandomSpeed(axis = 'x', blnDir = true) {
	const speedOptions = {
		xUpperSpeedBound: 4,
		xLowerSpeedBound: 3,
		yUpperSpeedBound: 3,
		yLowerSpeedBound: 2
	};
	let min;
	let max;
	if (axis === 'x') {
		min = speedOptions.xLowerSpeedBound;
		max = speedOptions.xUpperSpeedBound;
	} else {
		min = speedOptions.yLowerSpeedBound;
		max = speedOptions.yUpperSpeedBound;
	}

	let velocity = Math.random() * (max - min) + min;
	velocity = velocity.toFixed(2);
	const negDirection = blnDir ? Math.random() > 0.5 : false;
	return negDirection ? velocity * -1 : velocity;
}

module.exports = exports = Asteroid;
