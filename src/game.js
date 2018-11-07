const Player = require('./player.js');
const LetterBag = require('./letter-bag.js');
const Board = require('./board.js');

function Game(playerNamesArray, board = new Board, player = Player, letterBag = new LetterBag) {
  this.playerNames = playerNamesArray;
  this.playerCount = playerNamesArray.length;
  this.board = board;
  this.player = player;
  this.letterBag =letterBag;
  this.currentTurn = 1;
  this.players = [];
  this.playerNames.forEach((playerName, index) => {
    this.players.push(new Player(playerName, index + 1));
  });
}

Game.prototype.switchTurn = function() {
  this.currentTurn = this.currentTurn % this.playerCount + 1;
}

module.exports = Game;
