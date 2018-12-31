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

Tile.prototype.revertToBlank = function() {
  if(this.getValue() !== 0) throw 'Only blank tiles can be reset to blank.'
  if(this.getLetter() === '*') throw 'Tile already blank.'
  this.letter = '*';
}

module.exports = Tile;