/*global describe it expect */

const Asteroid = require('../Asteroid');

describe('test', () => {
	it('should pass', () => {
		expect('b').toBe('b');
	});

	it('should have a random speed', () => {
		const a = new Asteroid({ canvasElem: null, ctx: null });
		expect(a.options.translateX).not.toBe(-2);
	});
});
