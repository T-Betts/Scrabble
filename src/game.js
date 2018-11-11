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
  this.currentTurn = 1;
  this.players = [];
  playerNamesArray.forEach((playerName, index) => {
    this.players.push(player(playerName, index + 1));
  });
}

Game.prototype.switchTurn = function() {
  this.currentTurn = this.currentTurn % this.playerCount + 1;
}

Game.prototype.checkWordExists = function(word) {
  return this.dictionary.includes(word);
}

Game.prototype.placeTile = function(row, column, tilesArray, tilesArrayIndex) {
  this.board.squares[row][column] = tilesArray[tilesArrayIndex].letter;
  this.players[this.currentTurn - 1].getRack().splice(tilesArrayIndex, 1);
}

module.exports = Game;