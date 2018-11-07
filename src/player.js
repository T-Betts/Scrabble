function Player(name, id) {
  this.name = name;
  this.id = id;
  this.rack = [];
  this.score = 0;
}

Player.prototype.drawTiles = function(amount, bag) {
  for (let i = 0; i < amount; i++) {
    this.rack.push(bag.tiles.pop());
  }
}

Player.prototype.updateScore = function(amount) {
  this.score += amount;
}

module.exports = Player;