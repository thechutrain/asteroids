'use strict';

const defaultOpts = {
	color: 'rgba(48, 128, 232, 0.6)',
	// draw: true, // immediate draw or not
	animate: true,
	translateX: 4,
	translateY: 0,
};

function Asteroid(canvasElem, ctx, options) {
	this.options = defaultOpts || {} || options;
	this.canvasElem = canvasElem;
	this.ctx = ctx; // reference to the context

	this.points = [
		{ x: 0, y: 0 },
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

	// II.) Check if Asteroid values are on screen or not:
	// let every = this.isOffScreen();
	// let some = this.isOffScreen(false);
	// console.log(`Visible? ${this.isVisible()}`);
	// console.log(`Hidden? ${this.isHidden()}`);

	// if (this.onScreen && !this.isVisible()) {
	// 	this.onScreen = false;
	// 	this.reset();
	// 	console.log('reset!');
	// } else if (this.isVisible() && !this.onScreen) {
	// 	this.onScreen = true;
	// }

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
};

/**
 *
 * @param {boolean} allPoints - whether to check if all points are off screen or if some
 */
Asteroid.prototype.isOffScreen = function(allPoints = true) {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;
	let someOffScreen = false;
	let everyOffScreen = true;

	this.points.forEach(pt => {
		if (pt.x > xLimit || pt.x < 0) {
			someOffScreen = true;
		} else {
			everyOffScreen = false;
		}

		if (pt.y > yLimit || pt.y < 0) {
			someOffScreen = true;
		} else {
			everyOffScreen = false;
		}
	});

	return allPoints ? everyOffScreen : someOffScreen;
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
	const topEdge = findMax(this.points, 'y');
	const bottomEdge = findMin(this.points, 'y');

	// DEBUGGING
	console.log(this.points);
	debugger;

	// ==== ADJUST X-coordinates
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
			let adjustXBy = Math.ceil(Math.abs(leftEdge) / xLimit) + spacer;
			this.points.forEach(pt => {
				pt.x = Math.abs(pt.x) + adjustXBy;
			});
			updatedX = true;
		}
	}

	// CASE: moving down
	// if (this.options.translateY > 0) {
	// 	// Case: moving down, could potentially be below canvas
	// 	if (bottomEdge > yLimit) {
	// 		let adjustYBy = this.canvasElem.height + topEdge + spacer;
	// 		this.points.forEach(pt => {
	// 			pt.y = pt.y - adjustYBy;
	// 		});
	// 	}
	// } else {
	// 	// Case; moving up
	// 	// check if the entire shape is above the canvas
	// 	if (topEdge < 0) {
	// 		let adjustYBy = this.canvasElem.height + Math.abs(bottomEdge) + spacer;
	// 		this.points.forEach(pt => {
	// 			pt.y = pt.y - adjustYBy;
	// 		});
	// 	}
	// }

	debugger;
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
