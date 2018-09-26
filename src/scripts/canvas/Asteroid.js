'use strict';

const defaultOpts = {
	color: 'rgba(48, 128, 232, 0.6)',
	animate: true,
	translateX: -2,
	translateY: -3,
	spacer: 1, // additional padding space added when calculating off frame reset
};

function Asteroid(gameRef, options) {
	// TODO: add ability to override deafault options
	this.options = defaultOpts || {} || options;
	this.canvasElem = gameRef.canvasElem;
	this.ctx = gameRef.ctx; // reference to the context

	this.points = [
		{ x: 7, y: 0 },
		{ x: 17, y: 0 },
		{ x: 24, y: 7 },
		{ x: 24, y: 17 },
		{ x: 17, y: 24 },
		{ x: 7, y: 24 },
		{ x: 0, y: 17 },
		{ x: 0, y: 7 },
	];
	this.onScreen = true; // when true, means at least one point is on the canvas

	this.init();
}

Asteroid.prototype.init = function() {
	// const xUpperSpeedBound = 3;
	// const xLowerSpeedBound = -1;
	// this.options.translateX = Math.floor(
	// 	Math.random() * (xUpperSpeedBound - xLowerSpeedBound) + xLowerSpeedBound
	// );
	// const yUpperSpeedBound = 1;
	// const yLowerSpeedBound = -3;
	// this.options.translateY = Math.floor(
	// 	Math.random() * (yUpperSpeedBound - yLowerSpeedBound) + yLowerSpeedBound
	// );
};

Asteroid.prototype.calcPoints = function calcPoints(ticks) {
	const { translateX, translateY } = this.options;
	const moveXBy = ticks * translateX;
	const moveYBy = ticks * translateY;

	this.points.forEach(pt => {
		pt.x = pt.x + moveXBy;
		pt.y = pt.y + moveYBy;
	});

	if (!this.onScreen && this.isVisible()) {
		this.onScreen = true;
	} else if (this.isHidden()) {
		this.onScreen = false;
		this.reframe();
	}
};

Asteroid.prototype.drawPoints = function drawPoints() {
	const ctx = this.ctx;
	const { color } = this.options;

	ctx.save();
	ctx.fillStyle = color;
	ctx.beginPath();
	this.points.forEach((pt, i) => {
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
};

Asteroid.prototype.reframe = function reframe() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;

	// Determine left, right, top, bottom bounds of our shape:
	const { leftBound, rightBound, upperBound, lowerBound } = this.getBounds();

	// ===== ADJUST X-coordinates =====
	// CASE: moving right
	if (this.options.translateX > 0) {
		// Check to see if the trailing edge (far left x-coord on shape) is off screen
		if (leftBound > xLimit) {
			// then adjust all the x-coordinates
			let adjustXBy = rightBound + this.options.spacer;

			this.points.forEach(pt => {
				pt.x = pt.x - adjustXBy;
			});
		}
	} else {
		// CASE: moving left
		// checkt to see if shape may be off the canvas on the left-side
		if (rightBound < 0) {
			// all x-coordinates are off the screen & we need to update
			let adjustXBy = Math.abs(leftBound) + xLimit + this.options.spacer;

			this.points.forEach(pt => {
				pt.x = pt.x + adjustXBy;
			});
		}
	}

	// ===== ADJUST Y-coordinates =====
	// CASE: moving down
	if (this.options.translateY > 0) {
		// Case: moving down, could potentially be below canvas
		if (upperBound > yLimit) {
			let adjustYBy = lowerBound + this.options.spacer;

			this.points.forEach(pt => {
				pt.y = pt.y - adjustYBy;
			});
		}
	} else {
		// Case; moving up
		// check if the entire shape is above the canvas
		if (lowerBound < 0) {
			let adjustYBy = Math.abs(upperBound) + yLimit + this.options.spacer;

			this.points.forEach(pt => {
				pt.y = pt.y + adjustYBy;
			});
		}
	}
};

// ========= Visibility utility functions ==========
//#region visibility utility functions
/** isPartiallayVisible)_
 * @returns {boolean} - true --> indicates that the shape is partially hidden & partially visible.
 */
Asteroid.prototype.isPartiallyVisible = function() {
	return !this.isVisible() && !this.isHidden();
};

/** isVisible()
 * @returns {boolean} - true --> the entire asteroid/shape is visible on the screen
 */
Asteroid.prototype.isVisible = function() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;
	// let isVisible = false;

	return this.points.every(pt => {
		let { x, y } = pt;
		return x >= 0 && x <= xLimit && y >= 0 && y <= yLimit;
	});
};

/** isHidden()
 * @returns {boolean} - true, indicates the entire asteroid/shape is off screen
 */
Asteroid.prototype.isHidden = function() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;

	return this.points.every(pt => {
		let { x, y } = pt;
		return x < 0 || x > xLimit || y < 0 || y > yLimit;
	});
};
//#endregion

Asteroid.prototype.getBounds = function() {
	let leftBound, rightBound, upperBound, lowerBound;
	this.points.forEach((pt, i) => {
		let { x, y } = pt;
		//Set default:
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

	return { leftBound, rightBound, upperBound, lowerBound };
};

// function mergeOptions(opts) {}

module.exports = exports = Asteroid;
