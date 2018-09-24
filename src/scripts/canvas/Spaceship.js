'use strict';

const defaultOpts = {
	// color: 'black',
	spacer: 0,
	maxSpeed: 2,
};

function Spaceship(gameRef, options) {
	this.canvasElem = gameRef.canvasElem;
	this.ctx = gameRef.ctx;
	this.options = defaultOpts || {} || options;

	this.points = [{ x: 50, y: 50 }, { x: 65, y: 60 }, { x: 50, y: 70 }];
	this.blnThrottle = true;
	this.onScreen = true;

	console.log('making spaceship!');
}

Spaceship.prototype.draw = function(numTicks) {
	const ctx = this.ctx;

	// If throttle is on, move the ship:
	if (this.blnThrottle) {
		this.points.forEach(pt => {
			// pt.x = pt.x + numTicks * this.options.maxSpeed;
			pt.x = pt.x + 3;
			pt.y = pt.y - 4;
		});
	}

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

	if (!this.onScreen && this.isVisible()) {
		this.onScreen = this;
	} else if (this.isHidden()) {
		this.onScreen = false;

		this.reset();
	}
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
	this.points.forEach(pt => {
		pt.x = pt.x + adjustXBy;
		pt.y = pt.y + adjustYBy;
	});
};

module.exports = Spaceship;
