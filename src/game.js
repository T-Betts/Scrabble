const Player = require('./player.js');
const TileBag = require('./tile-bag.js');
const Board = require('./board.js');
const scrabbleDictionary = require('../word-list.js');

function Game(playerNamesArray, createPlayer = (name, id) => new Player(name, id), board = new Board, tileBag = new TileBag, dictionary = scrabbleDictionary) {
  this.playerCount = playerNamesArray.length;
  this.board = board;
  this.board.insertBonusSquares();
  this.tileBag = tileBag;
  this.dictionary = dictionary;
  this.capitalLettersRegEx = new RegExp('[*A-Z]');
  this.currentTurn = {playerID: 1, tileCoordinates: []};
  this.players = [];
  this.turnID = 1;
  this.turnHistory = [];
  playerNamesArray.forEach((playerName, index) => {
    this.players.push(createPlayer(playerName, index + 1));
  });
}

Game.prototype.switchTurn = function() {
  let finishedTurn = JSON.parse(JSON.stringify(this.currentTurn));
  this.turnHistory.push(finishedTurn);
  this.currentTurn.playerID = this.currentTurn.playerID % this.playerCount + 1;
  this.turnID++;
  this.currentTurn.tileCoordinates = [];
}

Game.prototype.checkWordExists = function(word) {
  return this.dictionary.includes(word);
}

Game.prototype.placeTile = function(row, column, rack, rackIndex) {
  if (this.capitalLettersRegEx.test(this.board.squares[row][column].letter)) {
    throw 'Square already occupied.';
  }
  this.board.squares[row][column] = rack[rackIndex];
  this.players[this.currentTurn.playerID - 1].getRack()[rackIndex] = {letter: '-'};
  this.currentTurn.tileCoordinates.push([row, column]);
}

Game.prototype.removeTile = function(row, column, rackIndex) {
  if (!JSON.stringify(this.currentTurn.tileCoordinates).includes(JSON.stringify([row, column]))) {
    throw 'No tile placed in this square during current turn.';
  }
  let initialTile = this.board.squares[row][column];
  Object.keys(this.board.getBonusSquares()).forEach((key) => {
    if (JSON.stringify(this.board.getBonusSquares()[key].indices).includes(JSON.stringify([row, column]))) {
      this.board.squares[row][column] = {letter: this.board.getBonusSquares()[key].symbol};
    } 
  });
  if (this.board.squares[row][column] === initialTile) {
    this.board.squares[row][column] = {letter: '-'}
  }
  for (let i = 0; i < this.tileBag.getTileTypes().length; i++) {
    if (this.tileBag.getTileTypes()[i].letter === initialTile.letter) {
      let replaceTile = this.tileBag.getCreateTile();
      removedTile = replaceTile(initialTile.letter, initialTile.value)
    }
  }
  this.players[this.currentTurn.playerID - 1].getRack()[rackIndex] = removedTile;  
  this.currentTurn.tileCoordinates.splice(this.currentTurn.tileCoordinates.map(el => String(el)).indexOf(JSON.stringify([row, column])), 1);
}

Game.prototype.sortTileCoordinatesArray = function(direction) {
  let i = direction === 'horizontal' ? 1 : 0
  this.currentTurn.tileCoordinates.sort((a, b) => {return a[i] > b[i] ? 1 : -1});
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

Game.prototype.getTilesNeighbourSquares = function(tileCoordinates) {
  let neighbourSquares = [];
  let row = tileCoordinates[0];
  let col = tileCoordinates[1];
  for (let i = row - 1; i <= row + 1; i++){
    if (i >= 0 && i <= 14) neighbourSquares.push([i, col]);
  }
  for (let i = col - 1; i <= col + 1; i++){
    if (i >= 0 && i <= 14) neighbourSquares.push([row, i]);
  }
  return neighbourSquares.filter(square => JSON.stringify(square) !== JSON.stringify(tileCoordinates));
}

Game.prototype.getWordsNeighbourSquares = function() {
  let wordNeighbours = [];
  this.currentTurn.tileCoordinates.forEach(square => wordNeighbours.push(this.getTilesNeighbourSquares(square)));
  let flatWordNeighbours = [].concat.apply([], wordNeighbours);
  return flatWordNeighbours;
}

Game.prototype.checkWordConnects = function() {
  let { tileCoordinates } = this.currentTurn;
  let neighbourSquares = this.getWordsNeighbourSquares();
  return neighbourSquares.some((square) => {
    return this.capitalLettersRegEx.test(this.board.squares[square[0]][square[1]].letter) && (!JSON.stringify(tileCoordinates).includes(JSON.stringify(square)))
  });
}

Game.prototype.validateTilePlacements = function () {
  let { tileCoordinates, direction } = this.currentTurn;
  let allSameCol = tileCoordinates.every(tc => tc[1] === tileCoordinates[0][1]);
  let allSameRow =  tileCoordinates.every(tc => tc[0] === tileCoordinates[0][0]);
  if (this.currentTurn.tileCoordinates.length === 0) throw 'No tiles placed.';
  if (this.turnID === 1 && !JSON.stringify(tileCoordinates).includes(JSON.stringify(this.board.getCentreSquareCoordinates()))) throw 'First move must use centre square.';
  if (allSameRow || allSameCol) {
    if (this.turnID > 1 && !this.checkWordConnects()) throw 'Invalid move. Must connect to previous moves.';
    direction = tileCoordinates.length === 1 ? 'oneTile' : allSameRow ?  'horizontal' : 'vertical';
    this.sortTileCoordinatesArray(direction);
    let boardSection = this.selectBoardSection(direction, tileCoordinates);
    return boardSection.every(square => this.capitalLettersRegEx.test(square.letter));
  } else {
    return false;
  }
}

module.exports = Game;

// let game = new Game(['Tom', 'Bill']);
// console.log(game.tileBag.createTile('A', 1))
// game.tileBag.shuffle();
// game.players[game.currentTurn.playerID - 1].drawTiles(5, game.tileBag);
// console.log('------------------------');
// console.log(game.board.squares)
// console.log(game.players[game.currentTurn.playerID -1].rack);
// game.placeTile(0,0,game.players[game.currentTurn.playerID - 1].rack, 3);
// console.log('------------------------');
// console.log(game.currentTurn.tileCoordinates)
// console.log(game.board.squares);
// console.log(game.players[game.currentTurn.playerID -1].rack);
// game.removeTile(0,0, 3);
// console.log('------------------------');
// console.log(game.board.squares)
// console.log(game.players[game.currentTurn.playerID -1].rack);
// console.log(game.currentTurn.tileCoordinates)