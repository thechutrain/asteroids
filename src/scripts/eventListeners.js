/**
 *
 */
'use strict';

const utils = require('./utils');
const paint = require('./canvas');

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
//#endregion window related event listeners

/** =========== Document related Event Listeners ===========
 *
 */
//#region document related event listeners
const documentEventListeners = [
	// Test event listener here
	{
		event: 'click',
		cb: function(e) {
			// debugger;
			// console.log(`I occured: ${e}`);
		},
	},
	//#region Smooth scrolling Attempt
	// {
	// 	event: 'click',
	// 	selector: '.page-navigation a',
	// 	cb: function(e) {
	// 		// Prevent the instant navigation to the page
	// 		// e.preventDefault();

	// 		// Determine which page to scroll to:
	// 		const targetId = e.target.getAttribute('href').replace(/^#/gi, '');
	// 		const eleId = document.getElementById(targetId);
	// 		const pageElem = utils.getClosest(eleId, '.full-screen');

	// 		// If it finds the page to scroll to navigate to it:
	// 		if (pageElem) {
	// 			const topPx = pageElem.getBoundingClientRect().top;
	// 			window.scroll({
	// 				top: topPx,
	// 				behavior: 'smooth',
	// 			});

	// 			// Update focus: set tabindex="-1"
	// 			pageElem.focus();
	// 			if (pageElem === document.activeElement) {
	// 				// debugger;
	// 			} else {
	// 				// debugger;
	// 				pageElem.setAttribute('tabindex', '-1');
	// 			}
	// 		}
	// 	},
	// },
	//#endregion
];

function registerDocumentEventListeners() {
	const loadListeners = function() {
		// Any additional functions that require the document with loaded content
		paint();

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
	};

	// IE9+ fix: http://youmightnotneedjquery.com/#ready
	if (
		// NOTE document.attachEvent --> for Opera & Internet Explorer below 9
		document.attachEvent
			? document.readyState === 'complete'
			: document.readyState !== 'loading'
	) {
		loadListeners();
	} else {
		document.addEventListener('DOMContentLoaded', loadListeners);
	}
}
//#region document related event listeners

module.exports = exports = function eventListeners() {
	registerWindowEventListeners();
	registerDocumentEventListeners();
};
