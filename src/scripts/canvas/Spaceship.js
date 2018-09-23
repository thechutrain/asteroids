'use strict';

const defaultOpts = {
	// color: 'black',
};

function Spaceship(gameRef, options) {
	this.canvasElem = gameRef.canvasElem;
	this.ctx = gameRef.ctx;
	this.options = defaultOpts || {} || options;

	this.points = [
		{
			x: 50,
			y: 50,
		},
		{ x: 65, y: 60 },
		{ x: 50, y: 70 },
	];

	console.log('making spaceship!');
}

Spaceship.prototype.draw = function() {
	const ctx = this.ctx;

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
};

module.exports = Spaceship;
