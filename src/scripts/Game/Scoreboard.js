function Scoreboard() {
	// Data-layer variables
	this.score = 0;
	this.lives = 3;

	// View-layer variables
	this.livesSelector = '#lives';
	this.scoreSelector = '#score';
	this.livesDOM;
	this.scoreDOM;

	this.init();
}

Scoreboard.prototype.init = function init(){
	this.livesDOM = document.querySelector(`${this.livesSelector}`);
	this.livesDOM.innerHTML = this.lives;

	this.scoreDOM = document.querySelector(`${this.scoreSelector}`);
	this.scoreDOM.innerHTML = this.score;
};

Scoreboard.prototype.setLife = function setLife(number){
	if (typeof number === 'number') {
		this.lives = number;
		return;
	} else if(typeof number === 'string') {
		switch(number) {
		case '+1':
			this.lives +=1;
			break;
		case '-1':
			this.lives -=1;
			break;
		default:
			console.warn('did not compute');
			break;
		}
	}
	
	this.livesDOM.innerHTML = this.lives;
};

Scoreboard.prototype.addScore = function addScore(number) {
	this.score += number;
	this.scoreDOM.innerHTML = this.score;
};

module.exports = Scoreboard;