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
  this.capitalLettersRegEx = new RegExp('^[A-Z\d&Ñ]+$');
  this.currentTurn = {playerID: 1, tileCoordinates: [], direction: undefined};
  this.players = [];
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

Game.prototype.validateTilePlacements = function () {
  let tcs = this.currentTurn.tileCoordinates;
  let direction = this.currentTurn.direction
  if (this.currentTurn.tileCoordinates.length === 0) throw 'No tiles placed';
  let allSameCol = tcs.every(tc => tc[1] === tcs[0][1]);
  let allSameRow =  tcs.every(tc => tc[0] === tcs[0][0]);
  if (allSameRow || allSameCol) {
    direction = tcs.length === 1 ? 'oneTile' : allSameRow ?  'horizontal' : 'vertical';
    this.sortTileCoordinatesArray(direction);
    if (direction === 'horizontal') {
      let row = tcs[0][0];
      let min = tcs[0][1];
      let max = tcs[tcs.length - 1][1];
      let boardSection = []; 
      for (let col = min; col <= max; col++) {
        boardSection.push(this.board.squares[row][col]);
      }
      return boardSection.every(square => square.match(this.capitalLettersRegEx) ? true : false);
    } else if (direction === 'vertical' || direction === 'oneTile') {
      let col = tcs[0][1];
      let min = tcs[0][0];
      let max = tcs[tcs.length - 1][0];
      let boardSection = [];

      for (let row = min; row <= max; row++) {
        boardSection.push(this.board.squares[row][col]);
      }
      return boardSection.every(square => square.match(this.capitalLettersRegEx) ? true : false);
    } 
  } else {
    return false;
  }
}

module.exports = Game;