const arraysEqual = require('./helper-functions.js').arraysEqual;
const scrabbleDictionary = require('../word-list.js');

function Turn(player, startBoard, tileBag, turnID, dictionary = scrabbleDictionary) {
  this.id = turnID;
  this.player = player;
  this.score = 0;
  this.board = startBoard;
  this.tilesCoordinates = [];
  this.allWordsCoordinates = [];
  this.words = [];
  this.dictionary = dictionary;
  this.tileBag = tileBag;
  this.capitalLettersRegEx = new RegExp('[*A-Z]');
}

Turn.prototype.checkWordExists = function(word) {
  return this.dictionary.includes(word);
}

Turn.prototype.placeTile = function(row, column, rackIndex) {
  let rack = this.player.getRack();
  if (rack[rackIndex].value === undefined) throw 'Selected rack space does not contain a tile.';
  if (this.capitalLettersRegEx.test(this.board.squares[row][column].letter)) {
    throw 'Square already occupied.';
  }
  this.board.squares[row][column] = rack[rackIndex];
  rack[rackIndex] = {letter: '-'};
  this.tilesCoordinates.push([row, column]);
}

Turn.prototype.removeTile = function(row, column, rackIndex) {
  if (!this.tilesCoordinates.some(tc => arraysEqual(tc, [row, column]))) {
    throw 'No tile placed in this square during current turn.';
  }
  let initialTile = this.board.squares[row][column];
  Object.keys(this.board.getBonusSquares()).forEach((key) => {
    if (this.board.getBonusSquares()[key].indices.some(index => arraysEqual(index, [row, column]))) {
      this.board.squares[row][column] = {letter: this.board.getBonusSquares()[key].symbol};
    } 
  });
  if (this.board.squares[row][column] === initialTile) {
    this.board.squares[row][column] = {letter: '-'};
  }
  let removedTile = this.tileBag.getCreateTile()(initialTile.letter, initialTile.value);
  this.player.getRack()[rackIndex] = removedTile;
  this.tilesCoordinates.splice(this.tilesCoordinates.map(el => String(el)).indexOf(JSON.stringify([row, column])), 1);  
}

Turn.prototype.sortTileCoordinatesArray = function(direction) {
  let i = direction === 'horizontal' ? 1 : 0
  this.tilesCoordinates.sort((a, b) => {return a[i] > b[i] ? 1 : -1});
}

Turn.prototype.selectBoardSection = function(direction, tilesCoordinates) {
  let boardSection = []; 
  if (direction === 'horizontal' || direction === 'oneTile') {
    let row = tilesCoordinates[0][0];
    let min = tilesCoordinates[0][1];
    let max = tilesCoordinates[tilesCoordinates.length - 1][1];
    for (let col = min; col <= max; col++) {
      boardSection.push(this.board.squares[row][col]);
    }
  } else if (direction === 'vertical') {
    let col = tilesCoordinates[0][1];
    let min = tilesCoordinates[0][0];
    let max = tilesCoordinates[tilesCoordinates.length - 1][0];
    for (let row = min; row <= max; row++) {
      boardSection.push(this.board.squares[row][col]);
    }
  }
  return boardSection;
}

Turn.prototype.getTilesNeighbourSquares = function(tileLocation) {
  let neighbourSquares = [];
  let row = tileLocation[0];
  let col = tileLocation[1];
  for (let i = row - 1; i <= row + 1; i++){
    if (i >= 0 && i <= 14) neighbourSquares.push([i, col]);
  }
  for (let i = col - 1; i <= col + 1; i++){
    if (i >= 0 && i <= 14) neighbourSquares.push([row, i]);
  }
  return neighbourSquares.filter(square => !arraysEqual(square, tileLocation));
}

Turn.prototype.getWordsNeighbourSquares = function() {
  let wordNeighbours = [];
  this.tilesCoordinates.forEach(square => wordNeighbours.push(this.getTilesNeighbourSquares(square)));
  let flatWordNeighbours = [].concat.apply([], wordNeighbours);
  return flatWordNeighbours;
}

Turn.prototype.checkWordConnects = function() {
  return this.getWordsNeighbourSquares().some((square) => {
    return this.capitalLettersRegEx.test(this.board.squares[square[0]][square[1]].letter) && (!this.tilesCoordinates.some(tc => arraysEqual(tc, square)));
  });
}

Turn.prototype.validateTilePlacements = function () {
  let tilesCoordinates = this.tilesCoordinates;
  let allSameCol = tilesCoordinates.every(tc => tc[1] === tilesCoordinates[0][1]);
  let allSameRow =  tilesCoordinates.every(tc => tc[0] === tilesCoordinates[0][0]);
  if (this.id === 1 && tilesCoordinates.length === 1) throw 'Words must be longer than one letter.';
  if (tilesCoordinates.length === 0) throw 'No tiles placed.';
  if (this.id === 1 && !tilesCoordinates.some(tc => arraysEqual(tc, this.board.getCentreSquareCoordinates()))) throw 'First move must use centre square.';
  if (allSameRow || allSameCol) {
    if (this.id > 1 && !this.checkWordConnects()) throw 'Invalid move. Must connect to previous moves.';
    this.direction = tilesCoordinates.length === 1 ? 'oneTile' : allSameRow ?  'horizontal' : 'vertical';
    this.sortTileCoordinatesArray(this.direction);
    let boardSection = this.selectBoardSection(this.direction, tilesCoordinates);
    if (boardSection.every(square => this.capitalLettersRegEx.test(square.letter))) {
      return true;
    } else {
      throw 'Invalid move. No non-letter spaces between placed tiles allowed.';
    }
  } else {
    throw 'Invalid move. Tiles must all be in same row or column.';
  } 
}

Turn.prototype.collectHorizontalAdjacentTiles = function(tileLocation) {
  if (this.tilesCoordinates[0] === undefined) throw 'No words to collect as no tiles have been placed this turn.';
  let squares = this.board.squares;
  let horizontalCoordinates = [];
  for (let i = tileLocation[1]; i >= 0; i--) {
    if(this.capitalLettersRegEx.test(squares[tileLocation[0]][i].letter)) {
      horizontalCoordinates.unshift([tileLocation[0], i]);
    } else {
      break;
    }
  }
  for (let i = tileLocation[1] + 1; i < squares.length; i++) {
    if(this.capitalLettersRegEx.test(squares[tileLocation[0]][i].letter)) {
      horizontalCoordinates.push([tileLocation[0], i]);
    } else {
      break;
    }
  }
  this.allWordsCoordinates.push(horizontalCoordinates);
}

Turn.prototype.collectVerticalAdjacentTiles = function(tileLocation) {
  if (this.tilesCoordinates[0] === undefined) throw 'No words to collect as no tiles have been placed this turn.';
  let squares = this.board.squares;
  let verticalCoordinates = [];
  for (let i = tileLocation[0]; i >= 0; i--) {
    if(this.capitalLettersRegEx.test(squares[i][tileLocation[1]].letter)) {
      verticalCoordinates.unshift([i, tileLocation[1]]);
    } else {
      break;
    }
  }
  for (let i = tileLocation[0] + 1; i < squares.length; i++) {
    if(this.capitalLettersRegEx.test(squares[i][tileLocation[1]].letter)) {
      verticalCoordinates.push([i, tileLocation[1]]);
    } else {
      break;
    }
  }
  this.allWordsCoordinates.push(verticalCoordinates);
}

Turn.prototype.collectCurrentTurnWordsCoordinates = function(tileLocation) {
  let direction = this.direction;
  if (direction === 'horizontal' || direction === 'oneTile') {
    this.collectHorizontalAdjacentTiles(tileLocation);
    this.tilesCoordinates.forEach((tc) => {
      this.collectVerticalAdjacentTiles(tc);
    });
  } else if (direction === 'vertical') {
    this.collectVerticalAdjacentTiles(tileLocation);
    this.tilesCoordinates.forEach((tc) => {
      this.collectHorizontalAdjacentTiles(tc);
    });
  }
  this.allWordsCoordinates = this.allWordsCoordinates.filter(word => word.length > 1);
}

Turn.prototype.getCurrentTurnsWords = function() {
  this.allWordsCoordinates.forEach((wordCoordinates) => {
    let word = [];
    wordCoordinates.forEach((coordinates) => {
      word.push(this.board.squares[coordinates[0]][coordinates[1]].letter.toLowerCase());
    })
    this.words.push(word.join(''));
  });
}

Turn.prototype.checkAllTurnsWordsExist = function() {
  let notWords = [];
  this.words.forEach((word) => {
    if (!this.checkWordExists(word)) {
      notWords.push(word.toUpperCase());
    }
  });
  if (notWords.length === 0) {
    return true
  } else {
    throw `Invalid word(s): ${notWords.join(', ')}`;
  }
}

Turn.prototype.calculateScore = function() {
  let turnScore = 0
  this.allWordsCoordinates.forEach((word) => {
    let wordScore = 0
    word.forEach((tile) => {
      wordScore += this.board.squares[tile[0]][tile[1]].value;
    })
    turnScore += wordScore;
  })
  return turnScore;
}

module.exports = Turn;