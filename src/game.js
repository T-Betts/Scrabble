const Player = require('./player.js');
const TileBag = require('./tile-bag.js');
const Board = require('./board.js');

function Game(playerNamesArray, player = (name, id) => new Player(name, id), board = new Board, letterBag = new TileBag) {
  this.playerNames = playerNamesArray;
  this.playerCount = playerNamesArray.length;
  this.board = board;
  this.letterBag =letterBag;
  this.currentTurn = 1;
  this.players = [];
  this.playerNames.forEach((playerName, index) => {
    this.players.push(player(playerName, index + 1));
  });
}

Game.prototype.switchTurn = function() {
  this.currentTurn = this.currentTurn % this.playerCount + 1;
}

module.exports = Game;
