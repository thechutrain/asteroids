/**
 * this is the entry file for my application that gulp will use to transpile to es5 & use browserify
 */
'use strict';

// ==================== Polyfills ====================
require('./polyfills')();

// ==================== Register Event Listeners ====================
const {
	registerWindowEventListeners,
	registerDocumentEventListeners,
} = require('./eventListeners');

registerWindowEventListeners();
registerDocumentEventListeners(main);

// ==================== Register Event Listeners ====================
const Game = require('./Game/Game');

console.log('starting game ...');

function main() {
	window.Game = new Game();
}
