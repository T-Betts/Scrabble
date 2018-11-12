const expect = require('chai').expect;
const sinon = require('sinon');
const Game = require('../src/game.js');
const Player = require('../src/player.js');
const Board = require('../src/board.js');
const TileBag = require('../src/tile-bag.js');

describe('Game', () => {
  let game;

    beforeEach(function() {
      let boardStub = sinon.createStubInstance(Board, {
        getSquares: [['-','-','-'],['-','-','-'],['-','-','-']],
        getBonusSquares: {
          doubleWordIndices: [[0, 0]],
          doubleLetterIndices: [[0, 1]],
          tripWordIndices: [[0, 2]],
          tripLetterIndices: [[1, 0]]
        }
      });
      let tileBagStub = sinon.createStubInstance(TileBag, {showRemainingTiles: [{letter: 'A', val: 1}, {letter: 'T', val: 1}]});
      let createPlayerStub = (name, id) => {
        return sinon.createStubInstance(Player, {getId: id, getRack: [
          {letter: 'A', val: 1}, {letter: 'T', val: 1}, {letter: 'E', val: 1},
          {letter: 'C', val: 3}, {letter: 'R', val: 1}, {letter: 'S', val: 1}
        ]});
      }
      game = new Game(['A', 'B', 'C'], createPlayerStub, boardStub, tileBagStub, ['exists']);
    });
    
  describe('switchTurn', () => {
    it('should switch the turn to the next player', () => {
      game.switchTurn();
      expect(game.currentTurn.playerID).to.deep.equal(game.players[1].getId());
    });

    it('should switch turn back to player 1 after a round of turns is complete', () => {
      game.switchTurn();
      game.switchTurn();
      game.switchTurn();
      expect(game.currentTurn.playerID).to.deep.equal(game.players[0].getId());
    });
  });

  describe('checkWordExists', () => {
    it('should return true if a given word is in the dictionary', () => {
      expect(game.checkWordExists('exists')).to.deep.equal(true);
    });

    it('should return false if a given word is not in the dictionary', () => {
      expect(game.checkWordExists('notInDictionary')).to.deep.equal(false);
    });
  });

  describe('placeTile', () => {
    let p1Rack;

    beforeEach(function() {
      p1Rack = game.players[0].getRack();
      game.board.squares = game.board.getSquares();
      game.placeTile(0, 0, p1Rack, 1);
    });

    it('should place a tile in a designated square on the board', () => {  
      expect(game.board.squares[0][0]).to.deep.equal("T");
    });

    it('should remove the placed tile from the current players rack', () => {
      expect(p1Rack).to.deep.equal([{letter: 'A', val: 1}, {letter: 'E', val: 1},
      {letter: 'C', val: 3}, {letter: 'R', val: 1}, {letter: 'S', val: 1}]);
    });

    it('should log the coordinates of the placed tiles for the current turn', () => {
      expect(game.currentTurn.tileCoordinates).to.deep.equal([[0,0]]);
    });
  });

  describe('removeTile', () => {
    beforeEach(function() {
      p1Rack = game.players[0].getRack();
      game.board.squares = game.board.getSquares();
    });

    it('removes a tile from a designated normal square', () => {
      game.placeTile(1, 1, p1Rack, 1);
      game.removeTile(1, 1);
      expect(game.board.squares[1][1]).to.deep.equal('-');
    });
  });
});