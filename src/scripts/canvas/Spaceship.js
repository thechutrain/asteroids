'use strict';

const defaultOpts = {
	// color: 'black',
	spacer: 0,
	maxSpeed: 11,
	minThrust: 4,
};

function Spaceship(gameRef, options) {
	this.canvasElem = gameRef.canvasElem;
	this.ctx = gameRef.ctx;
	this.options = defaultOpts || {} || options;

	// Position, Orientation, Sizing of Ship:
	this.origin = { x: 250, y: 200 };
	this.offSet = 0; // degrees offset from pointing 12 oclock
	this.r = 25;

	this.onScreen = true; // bln flag to help with reset

	// Current movement properties:
	this.thrusters = false;
	this.turnRight = false;
	this.turnLeft = false;
	this.throttleTimer;
	this.velocity = 0;
}

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
		this.offSet -= 5;
	} else if (this.turnLeft) {
		this.offSet += 5;
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
	this.points = [];
	this.points.push({ x: x1, y: y1 });
	this.points.push({ x: x2, y: y2 });
	this.points.push({ x: x3, y: y3 });
};

Spaceship.prototype.paintFrame = function(numTicks) {
	// If throttle is on, move the ship:
	// if (this.blnThrottleOn) {
	// 	this.points.forEach(pt => {
	// 		pt.x = pt.x + this.velocity * numTicks;
	// 		// pt.x = pt.x + numTicks * this.options.maxSpeed;
	// 		// pt.y = pt.y - 4 * numTicks;
	// 	});
	// }

	this.calcPoints();

	this.draw();

	if (!this.onScreen && this.isVisible()) {
		this.onScreen = this;
	} else if (this.isHidden()) {
		this.onScreen = false;

		this.reset();
	}
};

Spaceship.prototype.draw = function() {
	const ctx = this.ctx;

	// Draw the main triangle
	ctx.globalCompositeOperation = 'source-over';
	ctx.save();
	ctx.fillStyle = 'black';
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

	// Draw the opaque bottom triangle
	ctx.globalCompositeOperation = 'destination-out';
	ctx.beginPath();
	ctx.moveTo(this.origin.x, this.origin.y);
	ctx.lineTo(this.points[1].x, this.points[1].y);
	ctx.lineTo(this.points[2].x, this.points[2].y);
	ctx.closePath();
	ctx.fill();
	ctx.globalCompositeOperation = 'source-over';
};

Spaceship.prototype.isVisible = function() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;

	return this.points.every(pt => {
		let { x, y } = pt;
		return x >= 0 && x <= xLimit && y >= 0 && y <= yLimit;
	});
};

Spaceship.prototype.isHidden = function() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;

	return this.points.every(pt => {
		let { x, y } = pt;
		return x < 0 || x > xLimit || y < 0 || y > yLimit;
	});
};

Spaceship.prototype.getBounds = function() {
	let leftBound, rightBound, upperBound, lowerBound;
	this.points.forEach((pt, i) => {
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

Spaceship.prototype.reset = function() {
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

	// Loop through points:
	this.origin.x = this.origin.x + adjustXBy;
	this.origin.y = this.origin.y + adjustYBy;
};

module.exports = Spaceship;
