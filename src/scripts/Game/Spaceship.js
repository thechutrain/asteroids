'use strict';

const defaultOpts = {
	spacer: 0,
	maxSpeed: 9,
	minThrust: 3,
	rotationSpeed: 5,
};

function Spaceship(gameRef, options) {
	this.canvasElem = gameRef.canvasElem;
	this.ctx = gameRef.ctx;
	this.options = defaultOpts || {} || options;

	// Position, Orientation, Sizing of Ship:
	this.origin = { x: 250, y: 200 };
	this.offSet = 0; // degrees offset from pointing 12 oclock
	this.r = 25;
	this.prevPoints = [];
	this.currPoints = [];

	this.onScreen = true; // bln flag to help with reset

	// Current movement properties:
	this.thrusters = false;
	this.turnRight = false;
	this.turnLeft = false;
	this.throttleTimer;
	this.velocity = 0;
}

Spaceship.prototype.calcPoints = function() {
	this.checkSpeed();

	// Transform origin & angle here:
	if (this.velocity > 0) {
		this.origin.x =
			this.origin.x - this.velocity * Math.sin((Math.PI * this.offSet) / 180);
		this.origin.y =
			this.origin.y - this.velocity * Math.cos((Math.PI * this.offSet) / 180);
	}

	// TODO: convert into a function
	// Determine 3 points of triangle here:
	const h = 2 * this.r * Math.cos((Math.PI * 30) / 180);

	let angle1 = this.offSet;
	let x1 = this.origin.x - (Math.sin((Math.PI * angle1) / 180) * h) / 2;
	let y1 = this.origin.y - (Math.cos((Math.PI * angle1) / 180) * h) / 2;

	let angle2 = this.offSet + 60;
	let x2 = this.origin.x + (Math.sin((Math.PI * angle2) / 180) * h) / 2;
	let y2 = this.origin.y + (Math.cos((Math.PI * angle2) / 180) * h) / 2;

	let angle3 = this.offSet - 60;
	let x3 = this.origin.x + (Math.sin((Math.PI * angle3) / 180) * h) / 2;
	let y3 = this.origin.y + (Math.cos((Math.PI * angle3) / 180) * h) / 2;

	// Add three points in:
	this.prevPoints = this.currPoints;
	this.currPoints = [];
	this.currPoints.push({ x: x1, y: y1 });
	this.currPoints.push({ x: x2, y: y2 });
	this.currPoints.push({ x: x3, y: y3 });

	if (!this.onScreen && this.isVisible()) {
		this.onScreen = true;
	} else if (this.isHidden()) {
		this.onScreen = false;
		this.reframe();
	}
};

Spaceship.prototype.drawPoints = function() {
	const ctx = this.ctx;

	// Draw the main triangle
	ctx.globalCompositeOperation = 'source-over';
	ctx.save();
	ctx.fillStyle = 'black';
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

	// Draw the opaque bottom triangle
	ctx.globalCompositeOperation = 'destination-out';
	ctx.beginPath();
	ctx.moveTo(this.origin.x, this.origin.y);
	ctx.lineTo(this.currPoints[1].x, this.currPoints[1].y);
	ctx.lineTo(this.currPoints[2].x, this.currPoints[2].y);
	ctx.closePath();
	ctx.fill();
	ctx.globalCompositeOperation = 'source-over';
};

Spaceship.prototype.paintFrame = function() {
	this.calcPoints();
	this.drawPoints();
};

Spaceship.prototype.reframe = function() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;
	let adjustXBy = 0;
	let adjustYBy = 0;

	// Determine left, right, top, bottom bounds of our shape:
	const { leftBound, rightBound, upperBound, lowerBound } = this.getBounds();

	// Determine x-axis adjustments:
	if (leftBound > xLimit) {
		// adjustXBy =
		// 	-1 * Math.ceil(rightBound / xLimit) * xLimit + this.options.spacer;
		adjustXBy = (rightBound + this.options.spacer) * -1;
	} else if (rightBound < 0) {
		// adjustXBy = Math.ceil(leftBound / xLimit) * xLimit + this.options.spacer;
		adjustXBy = Math.abs(leftBound) + xLimit + this.options.spacer;
	}

	// Determine y-axis adjustments:
	if (upperBound > yLimit) {
		adjustYBy = -1 * (lowerBound + this.options.spacer);
	} else if (lowerBound < 0) {
		adjustYBy = Math.abs(upperBound) + yLimit + this.options.spacer;
	}

	// Update the origin & drawn out points:
	this.origin.x = this.origin.x + adjustXBy;
	this.origin.y = this.origin.y + adjustYBy;

	this.currPoints.forEach(pt => {
		pt.x = pt.x + adjustXBy;
		pt.y = pt.y + adjustYBy;
	});
};
/** ======== utility functions ========
 *
 * isVisible() : returns true if the entire shape is visible
 * isHidden() : returns true if the entire shape is hidden
 * getBounds() : returns { leftBound, rightBound, upperBound, lowerBound}
 */
//#region utility functions
Spaceship.prototype.isVisible = function() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;

	return this.currPoints.every(pt => {
		let { x, y } = pt;
		return x >= 0 && x <= xLimit && y >= 0 && y <= yLimit;
	});
};

Spaceship.prototype.isHidden = function() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;

	return this.currPoints.every(pt => {
		let { x, y } = pt;
		return x < 0 || x > xLimit || y < 0 || y > yLimit;
	});
};

Spaceship.prototype.getBounds = function() {
	let leftBound, rightBound, upperBound, lowerBound;
	this.currPoints.forEach((pt, i) => {
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
};
//#endregion utility functions

/** ======== Speed related functions ========
 *
 * checkSpeed() : adjusts velocity of spaceship
 * throttleOn() : turns thrusters on (continues until explicitly turned off)
 * throttleOff() : explicitly turns thursters off
 */
//#region speed related functions
Spaceship.prototype.checkSpeed = function() {
	if (this.thrusters) {
		if (this.velocity < this.options.minThrust) {
			this.velocity = this.options.minThrust;
		} else {
			this.velocity += 1;
			this.velocity = Math.min(this.velocity, this.options.maxSpeed);
		}
	}

	// Check if we're turning:
	if (this.turnRight && this.turnLeft) {
		this.offSet = this.offSet;
	} else if (this.turnRight) {
		this.offSet -= this.options.rotationSpeed;
	} else if (this.turnLeft) {
		this.offSet += this.options.rotationSpeed;
	}
};

Spaceship.prototype.throttleOn = function() {
	// reset here:
	this.thrusters = true;
	if (this.throttleTimer) {
		clearInterval(this.throttleTimer);
	}
};

Spaceship.prototype.throttleOff = function() {
	this.thrusters = false;

	clearInterval(this.throttleTimer);

	this.throttleTimer = setInterval(
		function() {
			this.velocity = this.velocity * 0.75;

			if (this.velocity < 1) {
				this.velocity = 0;
				clearInterval(this.throttleTimer);
			}
		}.bind(this),
		300
	);
};
//#endregion speed related functionality

module.exports = Spaceship;
