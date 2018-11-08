function TileBag() {
  const tileTypes = [
    {letter: 'A', val: 1, count: 9}, {letter: 'B', val: 3, count: 2}, {letter: 'C', val: 3, count: 2},
    {letter: 'D', val: 2, count: 4}, {letter: 'E', val: 1, count: 12}, {letter: 'F', val: 4, count: 2},
    {letter: 'G', val: 2, count: 3}, {letter: 'H', val: 4, count: 2}, {letter: 'I', val: 1, count: 9},
    {letter: 'J', val: 8, count: 1}, {letter: 'K', val: 5, count: 1}, {letter: 'L', val: 1, count: 4},
    {letter: 'M', val: 3, count: 2}, {letter: 'N', val: 1, count: 6}, {letter: 'O', val: 10, count: 8},
    {letter: 'P', val: 3, count: 2}, {letter: 'Q', val: 10, count: 1}, {letter: 'R', val: 1, count: 6},
    {letter: 'S', val: 1, count: 4}, {letter: 'T', val: 1, count: 6}, {letter: 'U', val: 1, count: 4},
    {letter: 'V', val: 4, count: 2}, {letter: 'W', val: 4, count: 2}, {letter: 'X', val: 8, count: 1},
    {letter: 'Y', val: 4, count: 2}, {letter: 'Z', val: 10, count: 1}, {letter: 'Blank', val: 0, count: 2}
  ];

  this.tiles = [];
  tileTypes.forEach(tileType => {
    for (let i = 0; i < tileType.count; i++) {
      this.tiles.push({letter: tileType.letter, val: tileType.val});
    }
  });
}

TileBag.prototype.remainingTilesCount = function() {
  return this.tiles.length;
}

// Durstenfeld Shuffle
TileBag.prototype.shuffle = function () {
  for (let i = this.tiles.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = this.tiles[i];
    this.tiles[i] = this.tiles[j];
    this.tiles[j] = temp;
  }
}

module.exports = TileBag;