const Player = require('./player.js');
const TileBag = require('./tile-bag.js');
const Board = require('./board.js');
const scrabbleDictionary = require('../word-list.js');
const arraysEqual = require('./helper-functions.js').arraysEqual;

function Game(playerNamesArray, createPlayer = (name, id) => new Player(name, id), board = new Board, tileBag = new TileBag, dictionary = scrabbleDictionary) {
  this.playerCount = playerNamesArray.length;
  this.board = board;
  this.board.insertBonusSquares();
  this.tileBag = tileBag;
  this.dictionary = dictionary;
  this.capitalLettersRegEx = new RegExp('[*A-Z]');
  this.currentTurn = {playerID: 1, tilesCoordinates: [], allWordsCoordinates: [], words: []};
  this.players = [];
  this.turnID = 1;
  this.turnHistory = [];
  playerNamesArray.forEach((playerName, index) => {
    this.players.push(createPlayer(playerName, index + 1));
  });
}

Game.prototype.switchTurn = function() {
  let finishedTurn = JSON.parse(JSON.stringify(this.currentTurn));
  this.turnHistory.push(finishedTurn);
  this.currentTurn.playerID = this.currentTurn.playerID % this.playerCount + 1;
  this.turnID++;
  this.currentTurn.tilesCoordinates = [];
  this.currentTurn.allWordsCoordinates = [];
  this.currentTurn.words = [];
}

Game.prototype.checkWordExists = function(word) {
  return this.dictionary.includes(word);
}

Game.prototype.placeTile = function(row, column, rack, rackIndex) {
  let currentPlayerRack = this.players[this.currentTurn.playerID - 1].getRack()
  if (currentPlayerRack[rackIndex].value === undefined) throw 'Selected rack space does not contain a tile.'
  if (this.capitalLettersRegEx.test(this.board.squares[row][column].letter)) {
    throw 'Square already occupied.';
  }
  this.board.squares[row][column] = rack[rackIndex];
  currentPlayerRack[rackIndex] = {letter: '-'};
  this.currentTurn.tilesCoordinates.push([row, column]);
}

Game.prototype.removeTile = function(row, column, rackIndex) {
  if (!this.currentTurn.tilesCoordinates.some(tc => arraysEqual(tc, [row, column]))) {
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
  for (let i = 0; i < this.tileBag.getTileTypes().length; i++) {
    if (this.tileBag.getTileTypes()[i].letter === initialTile.letter) {
      removedTile = this.tileBag.getCreateTile()(initialTile.letter, initialTile.value);
    }
  }
  this.players[this.currentTurn.playerID - 1].getRack()[rackIndex] = removedTile;
  this.currentTurn.tilesCoordinates.splice(this.currentTurn.tilesCoordinates.map(el => String(el)).indexOf(JSON.stringify([row, column])), 1);  
}

Game.prototype.sortTileCoordinatesArray = function(direction) {
  let i = direction === 'horizontal' ? 1 : 0
  this.currentTurn.tilesCoordinates.sort((a, b) => {return a[i] > b[i] ? 1 : -1});
}

Game.prototype.selectBoardSection = function(direction, tilesCoordinates) {
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

Game.prototype.getTilesNeighbourSquares = function(tileLocation) {
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

Game.prototype.getWordsNeighbourSquares = function() {
  let wordNeighbours = [];
  this.currentTurn.tilesCoordinates.forEach(square => wordNeighbours.push(this.getTilesNeighbourSquares(square)));
  let flatWordNeighbours = [].concat.apply([], wordNeighbours);
  return flatWordNeighbours;
}

Game.prototype.checkWordConnects = function() {
  let tilesCoordinates = this.currentTurn.tilesCoordinates;
  let neighbourSquares = this.getWordsNeighbourSquares();
  return neighbourSquares.some((square) => {
    return this.capitalLettersRegEx.test(this.board.squares[square[0]][square[1]].letter) && (!tilesCoordinates.some(tc => arraysEqual(tc, square)));
  });
}

Game.prototype.validateTilePlacements = function () {
  let tilesCoordinates = this.currentTurn.tilesCoordinates;
  let allSameCol = tilesCoordinates.every(tc => tc[1] === tilesCoordinates[0][1]);
  let allSameRow =  tilesCoordinates.every(tc => tc[0] === tilesCoordinates[0][0]);
  if (this.turnID === 1 && this.currentTurn.tilesCoordinates.length === 1) throw 'Words must be longer than one letter.'
  if (this.currentTurn.tilesCoordinates.length === 0) throw 'No tiles placed.';
  if (this.turnID === 1 && !tilesCoordinates.some(tc => arraysEqual(tc, this.board.getCentreSquareCoordinates()))) throw 'First move must use centre square.';
  if (allSameRow || allSameCol) {
    if (this.turnID > 1 && !this.checkWordConnects()) throw 'Invalid move. Must connect to previous moves.';
    this.currentTurn.direction = tilesCoordinates.length === 1 ? 'oneTile' : allSameRow ?  'horizontal' : 'vertical';
    this.sortTileCoordinatesArray(this.currentTurn.direction);
    let boardSection = this.selectBoardSection(this.currentTurn.direction, tilesCoordinates);
    if (boardSection.every(square => this.capitalLettersRegEx.test(square.letter))) {
      return true;
    } else {
      throw 'Invalid move. No non-letter spaces between placed tiles allowed.';
    }
  } else {
    throw 'Invalid move. Tiles must all be in same row or column.';
  } 
}

Game.prototype.play = function() {
  this.validateTilePlacements();
  this.collectCurrentTurnWordsCoordinates(this.currentTurn.tilesCoordinates[0]);
  this.getCurrentTurnsWords();
  this.checkAllTurnsWordsExist();
}

Game.prototype.collectHorizontalAdjacentTiles = function(tileLocation) {
  if (this.currentTurn.tilesCoordinates[0] === undefined) throw 'No words to collect as no tiles have been placed this turn.';
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
  this.currentTurn.allWordsCoordinates.push(horizontalCoordinates);
}

Game.prototype.collectVerticalAdjacentTiles = function(tileLocation) {
  if (this.currentTurn.tilesCoordinates[0] === undefined) throw 'No words to collect as no tiles have been placed this turn.';
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
  this.currentTurn.allWordsCoordinates.push(verticalCoordinates);
}

Game.prototype.collectCurrentTurnWordsCoordinates = function(tileLocation) {
  let direction = this.currentTurn.direction;
  if (direction === 'horizontal' || direction === 'oneTile') {
    this.collectHorizontalAdjacentTiles(tileLocation);
    this.currentTurn.tilesCoordinates.forEach((tc) => {
      this.collectVerticalAdjacentTiles(tc);
    });
  } else if (direction === 'vertical') {
    this.collectVerticalAdjacentTiles(tileLocation);
    this.currentTurn.tilesCoordinates.forEach((tc) => {
      this.collectHorizontalAdjacentTiles(tc);
    });
  }
  this.currentTurn.allWordsCoordinates = this.currentTurn.allWordsCoordinates.filter(word => word.length > 1);
}

Game.prototype.getCurrentTurnsWords = function() {
  this.currentTurn.allWordsCoordinates.forEach((wordCoordinates) => {
    let word = [];
    wordCoordinates.forEach((coordinates) => {
      word.push(this.board.squares[coordinates[0]][coordinates[1]].letter.toLowerCase());
    })
    this.currentTurn.words.push(word.join(''));
  });
}

Game.prototype.checkAllTurnsWordsExist = function() {
  let notWords = [];
  this.currentTurn.words.forEach((word) => {
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

module.exports = Game;