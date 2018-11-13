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
  this.currentTurn = {playerID: 1, tileCoordinates: []};
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
  this.board.squares[row][column] = rack[rackIndex].letter;
  this.players[this.currentTurn.playerID - 1].getRack().splice(rackIndex, 1);
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
  this.players[this.currentTurn.playerID - 1].getRack().splice(rackIndex, 0, removedTile);
}

module.exports = Game;