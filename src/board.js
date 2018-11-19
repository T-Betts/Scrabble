function Board() {
  this.squares = [];
  for (let i = 0; i < 15; i++) {
    this.squares.push([]);
    for (let j = 0; j < 15; j++) {
      this.squares[i].push({letter:'-'});
    }
  }
  this.bonusSquares = {
    doubleWord: {
      indices: [
        [1, 1], [1, 13], [2, 2], [2, 12], [3, 3], [3, 11], [4, 4], [4, 10], [7, 7], 
        [10, 4], [10, 10], [11, 3], [11, 11], [12, 2], [12, 12], [13, 1], [13, 13]
      ],
      symbol: '2'
    },
    doubleLetter: {
      indices: [
        [0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7],
        [3, 14], [6, 2], [6, 6], [6, 8], [6, 12], [7, 3], 
        [7, 11], [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], 
        [11, 7], [11, 14], [12, 6], [12, 8], [14, 3], [14, 11]
      ],
      symbol: 'd'
    },
    tripWord: {
      indices: [
        [0, 0], [0, 7], [0, 14], [7, 0],
        [7, 14], [14, 0], [14, 7], [14, 14]
      ],
      symbol: '3'
    },
    tripLetter: {
      indices: [
        [1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], 
        [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9], 
      ],
      symbol: 't'
    }
  }
  this.centreSquareCoordinates = [Math.ceil(this.squares.length / 2) - 1, Math.ceil(this.squares.length / 2) - 1];
}

Board.prototype.getSquares = function () {
  return this.squares;
}

Board.prototype.insertBonusSquares = function() {
  let bs = this.bonusSquares
  bs.tripWord.indices.forEach(twIndex => {
    this.squares[twIndex[0]][twIndex[1]].letter = '3';
  });
  bs.doubleWord.indices.forEach(dwIndex => {
    this.squares[dwIndex[0]][dwIndex[1]].letter = '2';
  });
  bs.tripLetter.indices.forEach(tlIndex => {
    this.squares[tlIndex[0]][tlIndex[1]].letter = 't';
  });
  bs.doubleLetter.indices.forEach(dlIndex => {
    this.squares[dlIndex[0]][dlIndex[1]].letter = 'd';
  });
}

Board.prototype.getBonusSquares = function() {
  return this.bonusSquares;
}

Board.prototype.getCentreSquareCoordinates = function() {
  return this.centreSquareCoordinates
}

Board.prototype.showLetterLayout = function() {
  let letterLayout = [];
  for (let i = 0; i < 15; i++) {
    letterLayout.push([]);
  }
  this.squares.forEach((row, index) => {
    row.forEach((square) => {
      letterLayout[index].push(square.letter);
    });
  });
  return letterLayout;
}

module.exports = Board;