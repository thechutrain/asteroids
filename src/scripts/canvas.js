'use strict';

// this --> points to canvas element
let count = 0;
let prevTime = window.performance.now();

function paint(highResTimestamp) {
	window.requestAnimationFrame(paint.bind(this));
	// Draw on the canvas:
	const ctx = this.getContext('2d');

	//#region circle
	// ctx.save();
	// ctx.beginPath();
	// ctx.arc(200, 200, 6, 0, Math.PI * 2, true);
	// ctx.stroke();
	// ctx.fill();
	//#endregion

	ctx.clearRect(0, 0, 300, 300); // clear rectangle

	// make a box
	ctx.fillRect(5, 10, 50, 50);
	ctx.fillStyle = 'rgba(48, 128, 232, 0.6)';
	ctx.translate(0.5, 2);

	// ctx.save();
	// ctx.restore();

	// ctx.translate(2, 1);

	// DEBUGGING PURPOSES:
	let timePastUpdate = highResTimestamp - prevTime;
	if (timePastUpdate > 20) {
		console.log(timePastUpdate);
	}

	prevTime = highResTimestamp;
}

// ================= initialization stuff ===============
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
