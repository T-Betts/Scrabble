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
      if (bag.length >= 1) {
        this.rack[i] = (bag.pop());
      }
    }
  }
}

Player.prototype.isRackEmpty = function() {
  return this.getRack().every(rackSpace => {return rackSpace.letter === '-'})
}

Player.prototype.getRackTotalValue = function() {
  let total = 0;
  if (this.isRackEmpty()) return total;
  this.rack.forEach(rackSpace => {total += rackSpace.value});
  return total;
}

module.exports = Player;