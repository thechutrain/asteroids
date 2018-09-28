function Bullet(gameRef, origin, offSet) {
	this.canvasElem = gameRef.canvasElem;
	this.ctx = gameRef.ctx;
	this.velocity = 5;
	this.origin = origin;
	this.offSet = offSet;
}

Bullet.prototype.calcPoints = function calcPoints() {
	this.origin.x =
		this.origin.x - this.velocity * Math.sin((Math.PI * this.offSet) / 180);
	this.origin.y =
		this.origin.y - this.velocity * Math.cos((Math.PI * this.offSet) / 180);
};

Bullet.prototype.drawPoints = function drawPoints() {
	const { x, y } = this.origin;
	this.ctx.beginPath();
	this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
	this.ctx.stroke();
};

module.exports = Bullet;
