const Player = require('./player.js');
const TileBag = require('./tile-bag.js');
const Board = require('./board.js');
const scrabbleDictionary = require('../word-list.js')

function Game(playerNamesArray, createPlayer = (name, id) => new Player(name, id), board = new Board, tileBag = new TileBag, dictionary = scrabbleDictionary) {
  this.playerCount = playerNamesArray.length;
  this.board = board;
  this.board.insertBonusSquares();
  this.tileBag = tileBag;
  this.dictionary = dictionary;
  this.capitalLettersRegEx = new RegExp('[A-Z]');
  this.currentTurn = {playerID: 1, tileCoordinates: []};
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
}

Game.prototype.checkWordExists = function(word) {
  return this.dictionary.includes(word);
}

Game.prototype.placeTile = function(row, column, rack, rackIndex) {
  if (this.board.squares[row][column].match(this.capitalLettersRegEx)) {
    throw 'Square already occupied.';
  }
  this.board.squares[row][column] = rack[rackIndex].letter;
  this.players[this.currentTurn.playerID - 1].getRack()[rackIndex] = '-';
  this.currentTurn.tileCoordinates.push([row, column]);
}

Game.prototype.removeTile = function(row, column, rackIndex) {
  if (!JSON.stringify(this.currentTurn.tileCoordinates).includes(JSON.stringify([row, column]))) {
    throw 'No tile placed in this square during current turn.';
  }
  let initialLetter = this.board.squares[row][column];
  Object.keys(this.board.getBonusSquares()).forEach((key) => {
    if (JSON.stringify(this.board.getBonusSquares()[key].indices).includes(JSON.stringify([row, column]))) {
      this.board.squares[row][column] = this.board.getBonusSquares()[key].symbol;
    } 
  });
  if (this.board.squares[row][column] === initialLetter) {
    this.board.squares[row][column] = '-';
  }
  for (let i = 0; i < this.tileBag.getTileTypes().length; i++) {
    if (this.tileBag.getTileTypes()[i].letter === initialLetter) {
      removedTile = {letter: initialLetter, value: this.tileBag.getTileTypes()[i].value};
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
  if (direction === 'horizontal') {
    let row = tileCoordinates[0][0];
    let min = tileCoordinates[0][1];
    let max = tileCoordinates[tileCoordinates.length - 1][1];
    for (let col = min; col <= max; col++) {
      boardSection.push(this.board.squares[row][col]);
    }
  } else if (direction === 'vertical' || direction === 'oneTile') {
    let col = tileCoordinates[0][1];
    let min = tileCoordinates[0][0];
    let max = tileCoordinates[tileCoordinates.length - 1][0];
    for (let row = min; row <= max; row++) {
      boardSection.push(this.board.squares[row][col]);
    }
  } 
  return boardSection;
}

Game.prototype.getNeighbourSquares = function(tileCoordinates) {
  let neighbourSquares = [];
  let row = tileCoordinates[0];
  let col = tileCoordinates[1];
  for (let i = row - 1; i <= row + 1; i++){
    neighbourSquares.push([i, col]);
  }
  for (let i = col - 1; i <= col + 1; i++){
    neighbourSquares.push([row, i]);
  }
  return neighbourSquares.filter(square => JSON.stringify(square) !== JSON.stringify(tileCoordinates));
}

Game.prototype.validateTilePlacements = function () {
  let { tileCoordinates, direction } = this.currentTurn;
  let allSameCol = tileCoordinates.every(tc => tc[1] === tileCoordinates[0][1]);
  let allSameRow =  tileCoordinates.every(tc => tc[0] === tileCoordinates[0][0]);
  if(this.turnID === 1 && !tileCoordinates.includes(this.board.getCentreSquareCoordinates())) throw 'First move must use centre square.'
  if (this.currentTurn.tileCoordinates.length === 0) throw 'No tiles placed.';
  if (allSameRow || allSameCol) {
    direction = tileCoordinates.length === 1 ? 'oneTile' : allSameRow ?  'horizontal' : 'vertical';
    this.sortTileCoordinatesArray(direction);
    let boardSection = this.selectBoardSection(direction, tileCoordinates);
    return boardSection.every(square => square.match(this.capitalLettersRegEx));
  } else {
    return false;
  }
}

module.exports = Game;