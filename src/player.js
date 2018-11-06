// const LetterBag = require('../src/letter-bag.js');

function Player(name, id) {
  this.name = name;
  this.id = id;
  this.rack = [];
  this.score = 0
}

Player.prototype.drawTiles = function(amount, bag = new LetterBag) {
  for (let i = 0; i < amount; i++) {
    this.rack.push(bag.tiles.pop())
  }
}

module.exports = Player;