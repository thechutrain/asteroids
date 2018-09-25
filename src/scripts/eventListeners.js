'use strict';

const utils = require('./utils');

/**TODO: reorganize
 * move documentEventListeners to the top, option to merge it
 * add ability to pass in a cb function (readyFN) to registerDocumentEventListeners
 */

/** =========== Window related Event Listeners ===========
 *
 */
//#region window related event listeners
function registerWindowEventListeners() {
	// === window related event listeners ===
	// Source: https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
	function resizeVh() {
		console.log('window resize fired!!!');

		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	}

	// === Add window event listeners ===
	window.addEventListener('resize', utils.initDebouncer(resizeVh, 100));
}
//#endregion

/** =========== Document related Event Listeners ===========
 *
 */
//#region document related event listeners

// REGISTER EVENT LISTENERS HERE:
const documentEventListeners = [
	// Test event listener here
	{
		event: 'keydown',
		cb: function(e) {
			if (e.keyCode === 38) {
				window.Game.emitEvent('throttle-on');
			} else if (e.keyCode === 39) {
				window.Game.emitEvent('right-on');
			} else if (e.keyCode === 37) {
				window.Game.emitEvent('left-on');
			}
		},
	},
	{
		event: 'keyup',
		cb: function(e) {
			if (e.keyCode === 38) {
				window.Game.emitEvent('throttle-off');
			} else if (e.keyCode === 39) {
				window.Game.emitEvent('right-off');
			} else if (e.keyCode === 37) {
				window.Game.emitEvent('left-off');
			}
		},
	},
];

function documentReadyCode(readyFn) {
	// Run any code that requires the DOMContent to be loaded
	if (typeof readyFn === 'function') {
		readyFn();
	}

	// Register documentEventListeners here
	documentEventListeners.forEach(listener => {
		if (listener.selector) {
			document.querySelectorAll(listener.selector).forEach(ele => {
				ele.addEventListener(listener.event, listener.cb);
				console.log('registered' + ele);
			});
		} else {
			// default: add listener to the document
			document.addEventListener(listener.event, listener.cb);
		}
	});
}

//TODO: add flexibility of adding various cb fn as argument that will get invoked
function registerDocumentEventListeners(readyFn) {
	// IE9+ fix: http://youmightnotneedjquery.com/#ready
	if (
		// NOTE document.attachEvent --> for Opera & Internet Explorer below 9
		document.attachEvent
			? document.readyState === 'complete'
			: document.readyState !== 'loading'
	) {
		documentReadyCode(readyFn);
	} else {
		document.addEventListener('DOMContentLoaded', function() {
			documentReadyCode(readyFn);
		});
	}
}
//#endregion

module.exports = {
	registerWindowEventListeners,
	registerDocumentEventListeners,
};
