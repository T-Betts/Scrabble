function Player(name, id) {
  this.name = name;
  this.id = id;
  this.rack = [];
  this.score = 0;
  for (let i = 0; i < 7; i++) {
    this.rack.push({letter: '-'}); 
  }
}

Player.prototype.updateScore = function(amount) {
  this.score += amount;
}

Player.prototype.getId = function() {
  return this.id;
}

Player.prototype.getRack = function() {
  return this.rack;
}

Player.prototype.drawMaxTiles = function(bag) {
  for (let i = 0; i < this.rack.length; i++) {
    if (this.rack[i].letter === '-') {
      this.rack[i] = (bag.pop());
    }
  }
}

module.exports = Player;