'use strict';

const defaultOpts = {
	color: 'rgba(48, 128, 232, 0.6)',
	animate: true,
	translateX: 3,
	translateY: 2,
	spacer: 1, // additional padding space added when calculating off frame reset
};

function Asteroid(gameRef, options) {
	// TODO: add ability to override deafault options
	this.options = defaultOpts || {} || options;
	this.canvasElem = gameRef.canvasElem;
	this.ctx = gameRef.ctx; // reference to the context

	this.origin = { x: 150, y: 130 };
	this.r = 45;
	this.offSet = 0;
	this.prevPoints = [];
	this.currPoints = [];

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

	this.origin.x = this.origin.x + moveXBy;
	this.origin.y = this.origin.y + moveYBy;

	this.offSet += 2;

	this.prevPoints = this.currPoints;
	this.currPoints = [];
	let sides = 5;
	let angleUnit = 360 / sides;
	for (let i = 0; i < sides; i++) {
		let angle = angleUnit * i + this.offSet;
		let newX = this.origin.x + Math.sin((Math.PI * angle) / 180) * this.r;
		let newY = this.origin.y + Math.cos((Math.PI * angle) / 180) * this.r;
		this.currPoints.push({ x: newX, y: newY });
	}

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
};

Asteroid.prototype.reframe = function reframe() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;
	let adjustXBy = 0;
	let adjustYBy = 0;

	// Determine left, right, top, bottom bounds of our shape:
	const { leftBound, rightBound, upperBound, lowerBound } = this.getBounds();

	// ===== ADJUST X-coordinates =====
	// CASE: moving right
	if (this.options.translateX > 0) {
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
	if (this.options.translateY > 0) {
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
		pt.x = pt.x + adjustXBy;
		pt.y = pt.y + adjustYBy;
	});
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

	return this.currPoints.every(pt => {
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

	return this.currPoints.every(pt => {
		let { x, y } = pt;
		return x < 0 || x > xLimit || y < 0 || y > yLimit;
	});
};
//#endregion

Asteroid.prototype.getBounds = function() {
	let leftBound, rightBound, upperBound, lowerBound;
	this.currPoints.forEach((pt, i) => {
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
