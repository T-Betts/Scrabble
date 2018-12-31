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

Tile.prototype.setBlankLetter = function(letter) {
  if(this.getValue() !== 0) throw 'Can\'t alter non-blank tiles.'
  this.letter = letter;
}

module.exports = Tile;