'use strict';

const utils = require('./utils');
const initGame = require('./canvas');

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
		event: 'click',
		cb: function(e) {
			// debugger;
			// console.log(`I occured: ${e}`);
		},
	},
];

function documentReadyCode() {
	// Any additional functions that require the document with loaded content
	initGame();

	// Register documentEventListeners here
	documentEventListeners.forEach(listener => {
		if (listener.selector) {
			document.querySelectorAll(listener.selector).forEach(ele => {
				ele.addEventListener(listener.event, listener.cb);
			});
		} else {
			// default: add listener to the document
			document.addEventListener(listener.event, listener.cb);
		}
	});
}

function registerDocumentEventListeners() {
	// IE9+ fix: http://youmightnotneedjquery.com/#ready
	if (
		// NOTE document.attachEvent --> for Opera & Internet Explorer below 9
		document.attachEvent
			? document.readyState === 'complete'
			: document.readyState !== 'loading'
	) {
		documentReadyCode();
	} else {
		document.addEventListener('DOMContentLoaded', documentReadyCode);
	}
}
//#endregion

module.exports = exports = function eventListeners() {
	registerWindowEventListeners();
	registerDocumentEventListeners();
};
