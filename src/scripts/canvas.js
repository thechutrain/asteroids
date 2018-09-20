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

	//#region circl
	ctx.beginPath();
	ctx.arc(200, 200, 3, 0, Math.PI * 2, true);
	ctx.stroke();
	ctx.fill();
	//#endregion
}

// window.main = function reqAnimationFrame() {
// 	window.requestAnimationFrame(main);

// 	console.log('requested!');
// };
// main();
module.exports = exports = paint;
