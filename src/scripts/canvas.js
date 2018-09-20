'use strict';

// this --> points to canvas element
let count = 0;
function paint() {
	// DEBUGGING;
	count++;
	if (count > 100) {
		console.log(`hit 100times`);
		count = count - 100;
	}

	// Draw on the canvas:
	const ctx = this.getContext('2d');

	//#region circle
	ctx.beginPath();
	ctx.arc(200, 200, 6, 0, Math.PI * 2, true);
	ctx.stroke();
	ctx.fill();
	ctx.save();
	ctx.translate(2, 1);
	//#endregion

	window.requestAnimationFrame(paint.bind(this));
}

function init() {
	const bgCanvas = validateCanvas();
	if (!bgCanvas) return;

	window.requestAnimationFrame(paint.bind(bgCanvas));
}

/** initializes canvas element & checks that its in the dom
 *
 * @return bgCanvas {canvas Element}
 */
//#region
function validateCanvas() {
	const bgCanvas = document.getElementById('bg-canvas');
	// let ctx;

	// Check for compatibility:
	if (!bgCanvas) {
		return false;
	} else if (!bgCanvas.getContext) {
		console.warn('canvas getContext not supported!');
		return false;
	}

	// Resize canvas:
	bgCanvas.width = window.innerWidth;
	bgCanvas.height = window.innerHeight;

	return bgCanvas;
}
//#endregion

module.exports = exports = init;
