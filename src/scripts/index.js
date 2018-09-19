/**
 * this is the entry file for my application that gulp will use to transpile to es5 & use browserify
 */
'use strict';

// ==== Polyfills =====
require('./polyfills')();

// ===== Register Event Listeners ====
const registerEventListenerFn = require('./eventListeners');
registerEventListenerFn();

// setTimeout(function() {
// 	console.log('test ...');

// 	let pageTwoEle = document.querySelector('#page-two');
// 	let parentNode = pageTwoEle.parentNode;
// 	let top = parentNode.getBoundingClientRect().top;
// 	console.log(`Scrolling to: ${top}`);
// 	window.scroll({
// 		top,
// 		behavior: 'smooth',
// 	});
// }, 2000);
