'use strict';

const classOptions = {
	xUpperSpeedBound: 4,
	xLowerSpeedBound: 3,
	yUpperSpeedBound: 3,
	yLowerSpeedBound: 2,
};

function Asteroid(gameRef, options) {
	// TODO: add ability to override deafault options
	this.options =
		{
			color: 'rgba(48, 128, 232, 0.6)',
			animate: true,
			spacer: 1, // additional padding space added when calculating off frame reset
		} || options;
	this.canvasElem = gameRef.canvasElem;
	this.ctx = gameRef.ctx; // reference to the context

	this.origin = { x: 150, y: 130 }; // gets overwritten by the init
	this.r = 45;
	this.offSet = 0;
	this.prevPoints = [];
	this.currPoints = [];

	this.scoreValue = 15;

	this.onScreen = true; // when true, means at least one point is on the canvas
	this.isActive = true; // determines if its been hit or not

	this.init();
}

//TODO: create random rotation, x & y axis speed
Asteroid.prototype.init = function() {
	const {
		xUpperSpeedBound,
		xLowerSpeedBound,
		yUpperSpeedBound,
		yLowerSpeedBound,
	} = classOptions;

	// Determine the random velocity
	this.options.translateX = getRandomSpeed(xLowerSpeedBound, xUpperSpeedBound);
	this.options.translateY = getRandomSpeed(yLowerSpeedBound, yUpperSpeedBound);

	// determine the new origin:
	let quadrant;
	if (this.options.translateX > 0) {
		quadrant = this.options.translateY > 0 ? 2 : 3;
	} else {
		quadrant = this.options.translateY > 0 ? 1 : 4;
	}

	let width = this.canvasElem.width;
	let height = this.canvasElem.height;

	switch (quadrant) {
	case 1:
		this.origin = { x: width + 10, y: -10 };
		break;
	case 2:
		this.origin = { x: -10, y: -10 };
		break;
	case 3:
		this.origin = { x: -10, y: height + 10 };
		break;
	case 4:
		this.origin = { x: width + 10, y: height + 10 };
		break;
	}

	function getRandomSpeed(min, max, blnDir = true) {
		let velocity = Math.random() * (max - min) + min;
		velocity = velocity.toFixed(2);
		let negDirection = blnDir ? Math.random() > 0.5 : false;
		return negDirection ? velocity * -1 : velocity;
	}
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
	let sides = 8;
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

Asteroid.prototype.containsPoint = function containsPoint(ptCoord) {
	if (!this.currPoints.length) return false;
	
	const { leftBound, rightBound, upperBound, lowerBound } = getBounds(
		this.currPoints
	);

	// Make sure the pt of interest is contained within its bounds:
	//TODO: should save this as a property of the asteroids object, instead of recalculating?? cache value
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
		} else {
			if (ptCoord.y === m * ptCoord.x + b) {
				isOnLine = true;
				return true; // this really doesn't matter
			}
			return ptCoord.y < m * ptCoord.x + b;
		}
	});

	if (isOnLine) {
		return true;
	} else {
		// check how many lines it was below
		let numLinesBelow = 0;
		let shouldEqual = Math.ceil(lineResults.length / 2);
		lineResults.forEach(res => {
			if (res) {
				numLinesBelow++;
			}
		});

		return numLinesBelow === shouldEqual;
	}

	// Refactor so its more general?
	function getBounds(coordArr) {
		let leftBound, rightBound, upperBound, lowerBound;
		coordArr.forEach((pt, i) => {
			let { x, y } = pt;
			if (i === 0) {
				//Sets default values
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
	}
};


module.exports = exports = Asteroid;
