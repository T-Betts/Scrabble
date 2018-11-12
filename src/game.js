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
  let initialLetter = this.board.squares[row][column]
  let bonusSquaresObject = this.board.getBonusSquares();
  Object.keys(bonusSquaresObject).forEach((key) => {
    if (JSON.stringify(bonusSquaresObject[key]).includes(JSON.stringify([row, column]))) {
      if (bonusSquaresObject[key] === bonusSquaresObject.doubleWordIndices) {
        this.board.squares[row][column] = '2';
      } else if (bonusSquaresObject[key] === bonusSquaresObject.doubleLetterIndices) {
        this.board.squares[row][column] = 'd';
      } else if (bonusSquaresObject[key] === bonusSquaresObject.tripWordIndices) {
        this.board.squares[row][column] = '3';
      } else if (bonusSquaresObject[key] === bonusSquaresObject.tripLetterIndices) {
        this.board.squares[row][column] = 't';
      } 
    } 
  });

  if (this.board.squares[row][column] === initialLetter) {
    this.board.squares[row][column] = '-';
  }
}

module.exports = Game;