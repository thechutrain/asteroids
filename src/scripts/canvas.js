'use strict';

function paint() {
	console.log(`painting canvas ...`);
	const bgCanvas = document.getElementById('bg-canvas');
	let ctx;

	// Check for compatibility:
	if (!bgCanvas) {
		return;
	} else if (!bgCanvas.getContext) {
		console.warn('canvas getContext not supported!');
		return;
	}

	// Resize canvas:
	bgCanvas.width = window.innerWidth;
	bgCanvas.height = window.innerHeight;

	// Draw on the canvas:
	ctx = bgCanvas.getContext('2d');

	//#region Rectangle example 1
	// ctx.fillStyle = 'rgb(200, 0, 0, 0.5)';
	// ctx.fillRect(10, 10, 50, 50);

	// ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
	// ctx.fillRect(30, 30, 50, 50);

	// ctx.fillRect(25, 50, 100, 200);
	//#endregion

	//#region triangle
	// ctx.beginPath();
	// ctx.moveTo(75, 50);
	// ctx.lineTo(100, 75);
	// ctx.lineTo(100, 25);
	// ctx.fill();
	//#endregion

	//#region circl
	ctx.beginPath();
	ctx.arc(200, 200, 3, 0, Math.PI * 2, true);
	ctx.stroke();
	ctx.fill();
	//#endregion
}

module.exports = exports = paint;
