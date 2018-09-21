'use strict';

const defaultOpts = {
	startingX: 5,
	startingY: 10,
	width: 50,
	height: 75,
	color: 'rgba(48, 128, 232, 0.6)',
	translateX: 2,
	translateY: 4,
	draw: true, // immediate draw or not
	animate: true,
};

function Asteroid(canvasElem, ctx, options) {
	this.options = defaultOpts || {} || options;
	this.canvasElem = canvasElem;
	this.ctx = ctx; // reference to the context

	this.foo = true;

	// Check to immediately draw or now
	// if (this.options.draw) {
	// 	this.draw(1);
	// }
}

Asteroid.prototype.draw = function(ticks) {
	const {
		// startingX,
		// startingY,
		width,
		height,
		color,
		animate,
		translateX,
		translateY,
	} = this.options;

	if (this.offScreen() && this.foo) {
		debugger;
		this.reset();
		this.foo = false;
	}

	this.ctx.save();
	this.ctx.fillStyle = color;
	this.ctx.fillRect(
		this.options.startingX,
		this.options.startingY,
		width,
		height
	);

	if (animate) {
		// Update the x & ys
		this.options.startingX = this.options.startingX + ticks * translateX;
		this.options.startingY = this.options.startingY + ticks * translateY;
	}

	this.ctx.restore();
};

/** --------- offScreen() ---------
 * returns {bool} - whether asteroid is on the screen or not
 */
// TODO: temp not precise, but good enough for now
Asteroid.prototype.offScreen = function offScreen() {
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;
	let someOffScreen = false;
	// let everyPtOffScreen //TODO: for more precision

	if (this.options.startingX < 0 || this.options.startingX > xLimit) {
		someOffScreen = true;
	}

	if (this.options.startingY < 0 || this.options.startingY > yLimit) {
		someOffScreen = true;
	}

	return someOffScreen;
};

/** --------- reset() ---------
 *
 */
Asteroid.prototype.reset = function reset() {
	const { startingX, startingY } = this.options;
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;
	let updateX = startingX < 0 || startingX > xLimit;
	let updateY = startingY < 0 || startingY > yLimit;

	// Make sure the new x is on screen
	if (updateX) {
		if (startingX < 0) {
			this.options.startingX = xLimit + this.options.width;
		} else {
			this.options.startingX = 0 - this.options.width;
		}
	}

	if (updateY) {
		if (startingY < 0) {
			this.options.startingY = yLimit + this.options.height;
		} else {
			this.options.startingY = 0 - this.options.height;
		}
	}
};

module.exports = exports = Asteroid;
