const Player = require('./player.js');
const TileBag = require('./tile-bag.js');
const Board = require('./board.js');
const scrabbleDictionary = require('../word-list.js')

function Game(playerNamesArray, player = (name, id) => new Player(name, id), board = new Board, tileBag = new TileBag, dictionary = scrabbleDictionary) {
  this.playerCount = playerNamesArray.length;
  this.board = board;
  this.board.insertBonusSquares();
  this.tileBag = tileBag;
  this.dictionary = dictionary;
  this.capitalLettersRegEx = new RegExp('[A-Z]');
  this.currentTurn = {playerID: 1, tileCoordinates: [], direction: undefined};
  this.players = [];
  this.turnID = 1
  playerNamesArray.forEach((playerName, index) => {
    this.players.push(player(playerName, index + 1));
  });
}

Game.prototype.switchTurn = function() {
  this.currentTurn.playerID = this.currentTurn.playerID % this.playerCount + 1;
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
      removedTile = {letter: initialLetter, val: this.tileBag.getTileTypes()[i].val};
    }
  }
  this.players[this.currentTurn.playerID - 1].getRack()[rackIndex] = removedTile;  
  this.currentTurn.tileCoordinates.splice(this.currentTurn.tileCoordinates.map(el => String(el)).indexOf(JSON.stringify([row, column])), 1);
}

Game.prototype.sortTileCoordinatesArray = function(direction) {
  if(direction === 'horizontal') {
    this.currentTurn.tileCoordinates.sort((a, b) => {return a[1] > b[1] ? 1 : -1});
  } else if (direction === 'vertical') {
    this.currentTurn.tileCoordinates.sort((a, b) => {return a[0] > b[0] ? 1 : -1});
  }
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

Game.prototype.validateTilePlacements = function () {
  let tileCoordinates = this.currentTurn.tileCoordinates;
  let direction = this.currentTurn.direction;
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