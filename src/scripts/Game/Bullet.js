function Bullet(gameRef, origin, offSet) {
	this.canvasElem = gameRef.canvasElem;
	this.ctx = gameRef.ctx;
	this.offSet = offSet;
	this.velocity = 10;
	this.maxDistance = 500;

	this.isActive = true;
	this.origin = origin;
	this.totalDistance = 0;
}

Bullet.prototype.calcPoints = function calcPoints() {
	this.origin.x =
		this.origin.x - this.velocity * Math.sin((Math.PI * this.offSet) / 180);
	this.origin.y =
		this.origin.y - this.velocity * Math.cos((Math.PI * this.offSet) / 180);

	// Check to see if the bullet is in bounds or not:
	const { leftBound, rightBound, upperBound, lowerBound } = this.getBounds();
	const xLimit = this.canvasElem.width;
	const yLimit = this.canvasElem.height;
	if (
		leftBound < 0 ||
		rightBound > xLimit ||
		upperBound < 0 ||
		lowerBound > yLimit
	) {
		this.isActive = false;
		return this;
	}

	// Calc overall distance travelled:
	this.totalDistance += this.velocity;
	if (this.totalDistance > this.maxDistance) {
		this.isActive = false;
	}

	// Make the fn chainable like jquery
	return this;
};

Bullet.prototype.drawPoints = function drawPoints() {
	if (!this.isActive) {
		return false;
	}

	const { x, y } = this.origin;
	this.ctx.beginPath();
	this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
	this.ctx.stroke();
};

Bullet.prototype.getBounds = function getBounds() {
	let points = this.currPoints || [this.origin];
	let leftBound, rightBound, upperBound, lowerBound;

	points.forEach((pt, i) => {
		if (i === 0) {
			leftBound = rightBound = pt.x;
			upperBound = lowerBound = pt.y;
		} else {
			leftBound = Math.min(leftBound, pt.x);
			rightBound = Math.max(rightBound, pt.x);
			upperBound = Math.min(upperBound, pt.y);
			lowerBound = Math.max(lowerBound, pt.y);
		}
	});

	return { leftBound, rightBound, upperBound, lowerBound };
};

module.exports = Bullet;
