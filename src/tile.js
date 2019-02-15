class Tile {
  constructor(letter, value) {
    this.letter = letter;
    this.value = value;
  }

  getLetter() {
    return this.letter;
  }

  getValue() {
    return this.value;
  }

  setBlankLetter(letter) {
    if(this.getValue() !== 0) throw 'Can\'t alter non-blank tiles.';
    this.letter = letter;
  }

  revertToBlank() {
    if(this.getValue() !== 0) throw 'Only blank tiles can be reset to blank.';
    if(this.getLetter() === '*') throw 'Tile already blank.';
    this.letter = '*';
  }
}

module.exports = Tile;