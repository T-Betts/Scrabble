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

Game.prototype.placeTile = function(row, column, tilesArray, tilesArrayIndex) {
  this.board.squares[row][column] = tilesArray[tilesArrayIndex].letter;
  this.players[this.currentTurn.playerID - 1].getRack().splice(tilesArrayIndex, 1);
  this.currentTurn.tileCoordinates.push([row, column]);
}

Game.prototype.removeTile = function(row, column) {
  this.board.squares[row][column] = '-'
}

module.exports = Game;

let game = new Game(['Tom', 'Bill']);
game.tileBag.shuffle();
game.players[game.currentTurn.playerID - 1].drawTiles(1, game.tileBag);
console.log(game.board.squares)
game.placeTile(1,1,game.players[game.currentTurn.playerID - 1].rack, 0);
console.log(game.board.squares);
game.removeTile(1,1);
console.log(game.board.squares)

