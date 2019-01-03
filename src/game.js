const Player = require('./player.js');
const TileBag = require('./tile-bag.js');
const Board = require('./board.js');
const Turn = require('./turn.js');


function Game(playerNamesArray, createPlayer = (name, id) => new Player(name, id), board = new Board, tileBag = new TileBag, createTurn = (player, startBoard, tileBag, turnID, dictionary) => new Turn(player, startBoard, tileBag, turnID, dictionary)) {
  this.playerCount = playerNamesArray.length;
  this.board = board;
  this.board.insertBonusSquares();
  this.isComplete = false;
  this.tileBag = tileBag;
  this.players = [];
  this.turnID = 1;
  this.turnHistory = [];
  this.createTurn = createTurn;
  playerNamesArray.forEach((playerName, index) => {
    this.players.push(createPlayer(playerName, index + 1));
  });
  this.currentTurn = this.createTurn(this.players[(this.turnID - 1) % this.playerCount], this.board, this.tileBag, this.turnID);
}


Game.prototype.shuffleAndDraw = function() {
  this.tileBag.shuffle();
  this.players.forEach(player => player.drawMaxTiles(this.tileBag.showRemainingTiles()));
}

Game.prototype.playTurn = function() {
  turn = this.currentTurn;
  turn.validateTilePlacements();
  turn.collectCurrentTurnWordsCoordinates(this.currentTurn.tilesCoordinates[0]);
  turn.getCurrentTurnsWords();
  turn.checkAllTurnsWordsExist();
  turn.calculateScore();
  this.currentTurn.player.updateScore(this.currentTurn.score);
  this.switchTurn();
}

Game.prototype.exchangeTurn = function(rackIndicesArray) {
  if (this.tileBag.showRemainingTiles().length < 7) throw 'Cannot exchange tiles when there are fewer than 7 tiles left in tile bag.';
  rackIndicesArray.forEach((index) => {
    let tile = this.currentTurn.player.getRack()[index];
    this.tileBag.showRemainingTiles().unshift(tile);
    this.currentTurn.player.getRack()[index] = {letter: '-'};
  });
  this.currentTurn.player.drawMaxTiles(this.tileBag.showRemainingTiles());
  this.switchTurn();
}

Game.prototype.switchTurn = function() {
  this.shuffleAndDraw();
  this.turnHistory.push(this.currentTurn);
  this.turnID++;
  this.currentTurn = this.createTurn(this.players[(this.turnID - 1) % this.playerCount], this.board, this.tileBag, this.turnID);
}

Game.prototype.checkStatus = function() {
  function playerRackEmpty(playerRack) {
    return playerRack.every(rackSpace => {return rackSpace.letter === '-'})
  }
  if (this.tileBag.showRemainingTiles().length === 0 && this.players.some(player => {return playerRackEmpty(player.getRack())})) {
    this.isComplete = true;
  }
}

module.exports = Game;