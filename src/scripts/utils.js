/** utility functions here
 *
 */
'use strict';

//#region debouncing & throttling
// source: https://css-tricks.com/debouncing-throttling-explained-examples/
function initThrottler(fn, timeout) {
	let canRun = true;

	return function throttled() {
		if (canRun) {
			canRun = false;
			fn.apply(this, arguments);
			setTimeout(function() {
				canRun = true;
			}, timeout);
		}
	};
}

function initDebouncer(fn, timout) {
	let timer;

	return function debounced() {
		if (timer) {
			clearTimeout(timer);
		}

		timer = setTimeout(function() {
			fn.apply(this, arguments);
		}, timout);
	};
}
//#endregion

// source: https://gomakethings.com/how-to-get-the-closest-parent-element-with-a-matching-selector-using-vanilla-javascript/
function getClosest(elem, selector) {
	for (; elem && elem !== document; elem = elem.parentNode) {
		if (elem.matches(selector)) return elem;
	}
	return null;
}

module.exports = { initThrottler, initDebouncer, getClosest };