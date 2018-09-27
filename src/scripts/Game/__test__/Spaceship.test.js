/*global describe it expect */

const Spaceship = require('../Spaceship');

const fakeCanvasElem = {
	width: 200,
	height: 100,
};

describe('test', () => {
	it('should be able to generate points from origin point', () => {
		const ship = new Spaceship(fakeCanvasElem);
		ship.calcPoints();

		expect(ship.points).toEqual([]);
	});
});
