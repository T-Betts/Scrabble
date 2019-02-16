const Player = require('./player.js');
const TileBag = require('./tile-bag.js');
const Board = require('./board.js');
const Turn = require('./turn.js');


function Game(playerNamesArray, createPlayer = (name, id) => new Player(name, id), board = new Board, tileBag = new TileBag, createTurn = (player, startBoard, tileBag, turnID, dictionary) => new Turn(player, startBoard, tileBag, turnID, dictionary)) {
  this.playerCount = playerNamesArray.length;
  this.board = board;
  this.board.insertBonusSquares();
  this.consecutivePassCount = 0;
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
  turn.collectAllWordsCoordinates(this.currentTurn.tilesCoordinates[0]);
  turn.getAllWords();
  turn.checkAllWordsExist();
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
  this.switchTurn();
}

Game.prototype.switchTurn = function() {
  if (this.isComplete) throw 'Game has finished.'
  this.currentTurn.tilesCoordinates.length === 0 ? this.consecutivePassCount += 1 :this.consecutivePassCount = 0;
  this.turnHistory.push(this.currentTurn);
  this.shuffleAndDraw();
  this.turnID++;
  this.checkStatus();
  this.currentTurn = this.createTurn(this.players[(this.turnID - 1) % this.playerCount], this.board, this.tileBag, this.turnID);
}

Game.prototype.checkStatus = function() {
  if (this.tileBag.showRemainingTiles().length === 0 && this.players.some(player => {return player.isRackEmpty()})) {
    this.isComplete = true;
  }
  if (this.consecutivePassCount >= (2 * this.playerCount)) this.isComplete = true;
}

Game.prototype.calculateFinalScores = function() {
  if (this.isComplete) {
    this.players.forEach((player) => {
      this.players.find(player => player.isRackEmpty()).updateScore(player.getRackTotalValue());
      player.score -= player.getRackTotalValue();
    });    
  } 
}

module.exports = Game;