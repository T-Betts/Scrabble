const Player = require('./player.js');
const TileBag = require('./tile-bag.js');
const Board = require('./board.js');
const scrabbleDictionary = require('../word-list.js');

function Game(playerNamesArray, createPlayer = (name, id) => new Player(name, id), board = new Board, tileBag = new TileBag, dictionary = scrabbleDictionary) {
  this.playerCount = playerNamesArray.length;
  this.board = board;
  this.board.insertBonusSquares();
  this.tileBag = tileBag;
  this.dictionary = dictionary;
  this.capitalLettersRegEx = new RegExp('[*A-Z]');
  this.currentTurn = {playerID: 1, tileCoordinates: [], allWordsCoordinates: [], words: []};
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
  this.currentTurn.tileCoordinates = [];
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
  this.currentTurn.tileCoordinates.push([row, column]);
}

Game.prototype.removeTile = function(row, column, rackIndex) {
  if (!JSON.stringify(this.currentTurn.tileCoordinates).includes(JSON.stringify([row, column]))) {
    throw 'No tile placed in this square during current turn.';
  }
  let initialTile = this.board.squares[row][column];
  Object.keys(this.board.getBonusSquares()).forEach((key) => {
    if (JSON.stringify(this.board.getBonusSquares()[key].indices).includes(JSON.stringify([row, column]))) {
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
  this.currentTurn.tileCoordinates.splice(this.currentTurn.tileCoordinates.map(el => String(el)).indexOf(JSON.stringify([row, column])), 1);
}

Game.prototype.sortTileCoordinatesArray = function(direction) {
  let i = direction === 'horizontal' ? 1 : 0
  this.currentTurn.tileCoordinates.sort((a, b) => {return a[i] > b[i] ? 1 : -1});
}

Game.prototype.selectBoardSection = function(direction, tileCoordinates) {
  let boardSection = []; 
  if (direction === 'horizontal' || direction === 'oneTile') {
    let row = tileCoordinates[0][0];
    let min = tileCoordinates[0][1];
    let max = tileCoordinates[tileCoordinates.length - 1][1];
    for (let col = min; col <= max; col++) {
      boardSection.push(this.board.squares[row][col]);
    }
  } else if (direction === 'vertical') {
    let col = tileCoordinates[0][1];
    let min = tileCoordinates[0][0];
    let max = tileCoordinates[tileCoordinates.length - 1][0];
    for (let row = min; row <= max; row++) {
      boardSection.push(this.board.squares[row][col]);
    }
  } 
  return boardSection;
}

Game.prototype.getTilesNeighbourSquares = function(tileCoordinates) {
  let neighbourSquares = [];
  let row = tileCoordinates[0];
  let col = tileCoordinates[1];
  for (let i = row - 1; i <= row + 1; i++){
    if (i >= 0 && i <= 14) neighbourSquares.push([i, col]);
  }
  for (let i = col - 1; i <= col + 1; i++){
    if (i >= 0 && i <= 14) neighbourSquares.push([row, i]);
  }
  return neighbourSquares.filter(square => JSON.stringify(square) !== JSON.stringify(tileCoordinates));
}

Game.prototype.getWordsNeighbourSquares = function() {
  let wordNeighbours = [];
  this.currentTurn.tileCoordinates.forEach(square => wordNeighbours.push(this.getTilesNeighbourSquares(square)));
  let flatWordNeighbours = [].concat.apply([], wordNeighbours);
  return flatWordNeighbours;
}

Game.prototype.checkWordConnects = function() {
  let tileCoordinates = this.currentTurn.tileCoordinates;
  let neighbourSquares = this.getWordsNeighbourSquares();
  return neighbourSquares.some((square) => {
    return this.capitalLettersRegEx.test(this.board.squares[square[0]][square[1]].letter) && (!JSON.stringify(tileCoordinates).includes(JSON.stringify(square)))
  });
}

Game.prototype.validateTilePlacements = function () {
  let tileCoordinates = this.currentTurn.tileCoordinates;
  let allSameCol = tileCoordinates.every(tc => tc[1] === tileCoordinates[0][1]);
  let allSameRow =  tileCoordinates.every(tc => tc[0] === tileCoordinates[0][0]);
  if (this.currentTurn.tileCoordinates.length === 0) throw 'No tiles placed.';
  if (this.turnID === 1 && !JSON.stringify(tileCoordinates).includes(JSON.stringify(this.board.getCentreSquareCoordinates()))) throw 'First move must use centre square.';
  if (allSameRow || allSameCol) {
    if (this.turnID > 1 && !this.checkWordConnects()) throw 'Invalid move. Must connect to previous moves.';
    this.currentTurn.direction = tileCoordinates.length === 1 ? 'oneTile' : allSameRow ?  'horizontal' : 'vertical';
    this.sortTileCoordinatesArray(this.currentTurn.direction);
    let boardSection = this.selectBoardSection(this.currentTurn.direction, tileCoordinates);
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
  this.collectCurrentTurnWordsCoordinates(this.currentTurn.tileCoordinates[0]);
}

Game.prototype.collectHorizontalAdjacentTiles = function(tileLocation) {
  if (this.currentTurn.tileCoordinates[0] === undefined) throw 'No words to collect as no tiles have been placed this turn.';
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
  if (this.currentTurn.tileCoordinates[0] === undefined) throw 'No words to collect as no tiles have been placed this turn.';
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
  let direction = this.currentTurn.direction
  if (direction === 'horizontal' || direction === 'oneTile') {
    this.collectHorizontalAdjacentTiles(tileLocation);
    this.currentTurn.tileCoordinates.forEach((tc) => {
      this.collectVerticalAdjacentTiles(tc)
    });
  } else if (direction === 'vertical') {
    this.collectVerticalAdjacentTiles(tileLocation);
    this.currentTurn.tileCoordinates.forEach((tc) => {
      this.collectHorizontalAdjacentTiles(tc)
    });
  }
  this.currentTurn.allWordsCoordinates = this.currentTurn.allWordsCoordinates.filter(word => word.length > 1);
}

module.exports = Game;