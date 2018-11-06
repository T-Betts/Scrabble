function Board() {
  this.squares = [];
  for (let i = 0; i < 15; i++) {
    this.squares.push([]);
    for (let j = 0; j < 15; j++) {
      this.squares[i].push('-');
    }
  }
  this.doubleWordIndexes = [
    [1, 1], [1, 13], [2, 2], [2, 12], [3, 3], [3, 11], [4, 4], [4, 10], [7, 7], 
    [10, 4], [10, 10], [11, 3], [11, 11], [12, 2], [12, 12], [13, 1], [13, 13]
  ];
  this.doubleLetterIndexes = [
    [0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7],
    [3, 14], [6, 2], [6, 6], [6, 8], [6, 12], [7, 3], 
    [7, 11], [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], 
    [11, 7], [11, 14], [12, 6], [12, 8], [14, 3], [14, 11]
  ];
  this.tripWordIndexes = [
    [0, 0], [0, 7], [0, 14], [7, 0],
    [7, 14], [14, 0], [14, 7], [14, 14]
  ];
  this.tripLetterIndexes = [
    [1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], 
    [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9], 
  ];
}

Board.prototype.insertBonusSquares = function() {
  this.tripWordIndexes.forEach(twIndex => {
    this.squares[twIndex[0]][twIndex[1]] = '3';
  });
  this.doubleWordIndexes.forEach(dwIndex => {
    this.squares[dwIndex[0]][dwIndex[1]] = '2';
  });
  this.tripLetterIndexes.forEach(tlIndex => {
    this.squares[tlIndex[0]][tlIndex[1]] = 't';
  });
  this.doubleLetterIndexes.forEach(dlIndex => {
    this.squares[dlIndex[0]][dlIndex[1]] = 'd';
  });
}

module.exports = Board;