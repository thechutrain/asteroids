/**
 * this is the entry file for my application that gulp will use to transpile to es5 & use browserify
 */
'use strict';

// ==== Polyfills =====
require('./polyfills')();

// ===== Register Event Listeners ====
const registerEventListenerFn = require('./eventListeners');
registerEventListenerFn();

