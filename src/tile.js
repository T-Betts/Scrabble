function Tile(letter, value) {
  this.letter = letter;
  this.value = value;
}

Tile.prototype.getLetter = function() {
  return this.letter;
}

Tile.prototype.getValue = function() {
  return this.value;
}

module.exports = Tile;