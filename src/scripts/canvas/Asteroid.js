'use strict';

const defaultOpts = {
	color: 'rgba(48, 128, 232, 0.6)',
	// draw: true, // immediate draw or not
	animate: true,
	translateX: -2,
	translateY: -1,
};

function Asteroid(canvasElem, ctx, options) {
	this.options = defaultOpts || {} || options;
	this.canvasElem = canvasElem;
	this.ctx = ctx; // reference to the context

	this.points = [
		{ x: 0, y: 0 },
		{ x: 100, y: 0 },
		{ x: 100, y: 50 },
		{ x: 50, y: 100 },
		{ x: 0, y: 0 },
	];
	this.onScreen = true; // {bln} - when true, means at least one point is on the canvas

	this.foo = true;
}

Asteroid.prototype.draw = function(ticks) {
	const ctx = this.ctx;
	const { color, animate, translateX, translateY } = this.options;
	const moveXBy = ticks * translateX;
	const moveYBy = ticks * translateY;

	// I.) Add transformation values for animation:
	this.points.forEach(pt => {
		pt.x = pt.x + moveXBy;
		pt.y = pt.y + moveYBy;
	});

	// III.) Draw Asteroid:
	//#region draw asteroid
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
	//#endregion

	// II.) Check if Asteroid values are on screen or not:
	if (!this.onScreen && this.isVisible()) {
		this.onScreen = true;
	}

	if (this.isHidden()) {
		this.onScreen = false;
		this.reset();
	}

	console.log(this.onScreen);
};

//*NOTE: both isVisible && isHidden --> checks that EVERY point is either hidden or visible
Asteroid.prototype.isPartiallyVisible = function() {
	return !this.isVisible() && !this.isHidden();
};

Asteroid.prototype.isVisible = function() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;
	// let isVisible = false;

	return this.points.every(pt => {
		let { x, y } = pt;
		return x >= 0 && x <= xLimit && y >= 0 && y <= yLimit;
	});
};

Asteroid.prototype.isHidden = function() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;

	return this.points.every(pt => {
		let { x, y } = pt;
		return x < 0 || x > xLimit || y < 0 || y > yLimit;
	});
};

Asteroid.prototype.reset = function reset() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;
	const spacer = 2;

	let updatedX = false;
	let updatedY = false;

	// Determine left, right, top, bottom bounds of our shape:
	const leftEdge = findMin(this.points, 'x');
	const rightEdge = findMax(this.points, 'x');
	const bottomEdge = findMax(this.points, 'y');
	const topEdge = findMin(this.points, 'y');

	// ===== ADJUST X-coordinates =====
	// CASE: moving right
	if (this.options.translateX > 0) {
		// Check to see if the trailing edge (far left x-coord on shape) is off screen
		if (leftEdge > xLimit) {
			// then adjust all the x-coordinates
			// let adjustXBy = Math.ceil(leftEdge / xLimit) + spacer;
			let adjustXBy = Math.ceil(rightEdge / xLimit) * xLimit + spacer;
			this.points.forEach(pt => {
				pt.x = pt.x - adjustXBy;
			});
			updatedX = true;
		}
	} else {
		// CASE: moving left
		// checkt to see if shape may be off the canvas on the left-side
		if (rightEdge < 0) {
			// all x-coordinates are off the screen & we need to update
			// let adjustXBy = Math.abs(leftEdge) + spacer;
			let adjustXBy = Math.ceil(Math.abs(leftEdge) / xLimit) * xLimit + spacer;
			this.points.forEach(pt => {
				pt.x = pt.x + adjustXBy;
			});
			updatedX = true;
		}
	}

	// ===== ADJUST Y-coordinates =====
	// CASE: moving down
	if (this.options.translateY > 0) {
		// Case: moving down, could potentially be below canvas
		if (topEdge > yLimit) {
			// let adjustYBy = this.canvasElem.height + topEdge + spacer;
			let adjustYBy = Math.ceil(topEdge / yLimit) * yLimit + spacer;
			this.points.forEach(pt => {
				pt.y = pt.y - adjustYBy;
			});
		}
	} else {
		// Case; moving up
		// check if the entire shape is above the canvas
		if (bottomEdge < 0) {
			let adjustYBy = Math.ceil(Math.abs(topEdge) / yLimit) * yLimit + spacer;
			this.points.forEach(pt => {
				pt.y = pt.y + adjustYBy;
			});
		}
	}
};

// ============== utility functions =======
function findMax(listPts, strCoord = 'x') {
	let max;
	listPts.forEach((pt, i) => {
		if (i == 0) {
			max = strCoord === 'y' ? pt.y : pt.x;
		} else {
			max = strCoord === 'y' ? Math.max(max, pt.y) : Math.max(max, pt.x);
		}
	});
	return max;
}

function findMin(listPts, strCoord = 'x') {
	let min;
	listPts.forEach((pt, i) => {
		if (i == 0) {
			min = strCoord === 'y' ? pt.y : pt.x;
		} else {
			min = strCoord === 'y' ? Math.min(min, pt.y) : Math.min(min, pt.x);
		}
	});
	return min;
}

module.exports = exports = Asteroid;
