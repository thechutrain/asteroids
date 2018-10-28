/* global describe it expect */

// const Asteroid = require('../Asteroid');

// const fakeCanvasElem = {
// 	width: 200,
// 	height: 100,
// };

describe('test', () => {
	it('should pass', ()=> {
		expect('a').toBe('a');
	})

	// it('should have a random speed', () => {
	// 	const a = new Asteroid({ canvasElem: fakeCanvasElem, ctx: null });
	// 	expect(a.options.translateX).not.toBe(-2);
	// });

	// it('should be able to determine if its completelly visible', () => {
	// 	const a = new Asteroid({ canvasElem: fakeCanvasElem, ctx: null });
	// 	a.points = [{ x: 30, y: 20 }, { x: 40, y: 30 }, { x: 30, y: 40 }];

	// 	expect(a.isVisible()).toBe(true);
	// });
});
