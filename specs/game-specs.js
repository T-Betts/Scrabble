const expect = require('chai').expect;
const sinon = require('sinon');
const Game = require('../src/game.js');
const Player = require('../src/player.js');
const Board = require('../src/board.js');
const TileBag = require('../src/tile-bag.js');

describe('Game', () => {
  let game;

    beforeEach(() => {
      let boardStub = sinon.createStubInstance(Board, {
        getSquares: [['-','-','-','-','-'],['-','-','-','-','-'],['-','-','-','-','-'],['-','-','-','-','-'],['-','-','-','-','-']],
        getBonusSquares: {
          doubleWord: {indices: [[0, 0]], symbol: '2'},
          doubleLetter: {indices: [[0, 1]], symbol: 'd'},
          tripWord: {indices: [[0, 2]], symbol: '3'},
          tripLetter: {indices: [[1, 0]], symbol: 't'}
        }
      });
      let tileBagStub = sinon.createStubInstance(TileBag, {
        showRemainingTiles: [{letter: 'A', val: 1}, {letter: 'T', val: 1}],
        getTileTypes: [{letter: 'A', val: 1, count: 9}, {letter: 'T', val: 1, count: 6}]
      });
      let createPlayerStub = (name, id) => {
        return sinon.createStubInstance(Player, {getId: id, getRack: [
          {letter: 'A', val: 1}, {letter: 'T', val: 1}, {letter: 'E', val: 1},
          {letter: 'C', val: 3}, {letter: 'R', val: 1}, {letter: 'S', val: 1}, '-'
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

    beforeEach(() => {
      p1Rack = game.players[0].getRack();
      game.board.squares = game.board.getSquares();
      game.placeTile(0, 0, p1Rack, 1);
    });

    it('should place a tile in a designated square on the board', () => {  
      expect(game.board.squares[0][0]).to.deep.equal("T");
    });

    it('should remove the placed tile from the current players rack', () => {
      expect(p1Rack).to.deep.equal([{letter: 'A', val: 1}, '-', {letter: 'E', val: 1},
      {letter: 'C', val: 3}, {letter: 'R', val: 1}, {letter: 'S', val: 1}, '-']);
    });

    it('should log the coordinates of the placed tiles for the current turn', () => {
      expect(game.currentTurn.tileCoordinates).to.deep.equal([[0,0]]);
    });

    it('should throw error if trying to place a tile in an already occupied square', () => {
      expect(() => {game.placeTile(0, 0, p1Rack, 1)}).to.throw('Square already occupied.');
    });
  });

  describe('removeTile', () => {
    beforeEach(() => {
      p1Rack = game.players[0].getRack();
      game.board.squares = game.board.getSquares();
    });

    it('removes a tile from a designated normal square', () => {
      game.placeTile(1, 1, p1Rack, 1);
      game.removeTile(1, 1, 1);
      expect(game.board.squares[1][1]).to.deep.equal('-');
    });

    it('removes a tile from a designated double word square', () => {
      game.placeTile(0, 0, p1Rack, 1);
      game.removeTile(0, 0, 1);
      expect(game.board.squares[0][0]).to.deep.equal('2');
    });

    it('removes a tile from a designated double letter square', () => {
      game.placeTile(0, 1, p1Rack, 1);
      game.removeTile(0, 1, 1);
      expect(game.board.squares[0][1]).to.deep.equal('d');
    });

    it('removes a tile from a designated triple word square', () => {
      game.placeTile(0, 2, p1Rack, 1);
      game.removeTile(0, 2, 1);
      expect(game.board.squares[0][2]).to.deep.equal('3');
    });

    it('removes a tile from a designated triple letter square', () => {
      game.placeTile(1, 0, p1Rack, 1);
      game.removeTile(1, 0, 1);
      expect(game.board.squares[1][0]).to.deep.equal('t');
    });

    it('should throw error if designated square does not contain tile letter placed during current turn', () => {
      expect(() => {game.removeTile(0,0, 1)}).to.throw('No tile placed in this square during current turn.');
    });

    it('should return removed tile to the current players rack', () => {
      game.placeTile(1, 0, p1Rack, 1);
      game.removeTile(1, 0, 1);
      expect(p1Rack).to.deep.equal([{letter: 'A', val: 1}, {letter: 'T', val: 1}, {letter: 'E', val: 1},
      {letter: 'C', val: 3}, {letter: 'R', val: 1}, {letter: 'S', val: 1}, '-']);
    });

    it('should remove chosen coordinates from current turn\'s tileCoordinates array', () => {
      game.placeTile(1, 0, p1Rack, 1);
      game.removeTile(1, 0, 1);
      expect(game.currentTurn.tileCoordinates.length).to.deep.equal(0);
    });
  });

  describe('sortTileCoordinatesArray', () => {
    beforeEach(() => {
      p1Rack = game.players[0].getRack();
      game.board.squares = game.board.getSquares();
    });

    it('should sort the tiles into correct order for horizontal words', () => {
      game.placeTile(1, 3, p1Rack, 1);
      game.placeTile(1, 1, p1Rack, 3);
      game.placeTile(1, 2, p1Rack, 2);
      game.sortTileCoordinatesArray('horizontal');
      expect(game.currentTurn.tileCoordinates).to.deep.equal([[1, 1], [1, 2], [1, 3]]);
    });

    it('should sort the tiles into correct order for horizontal words', () => {
      game.placeTile(3, 1, p1Rack, 1);
      game.placeTile(1, 1, p1Rack, 3);
      game.placeTile(2, 1, p1Rack, 2);
      game.sortTileCoordinatesArray('vertical');
      expect(game.currentTurn.tileCoordinates).to.deep.equal([[1, 1], [2, 1], [3, 1]]);
    });
  });

  describe('validateTilePlacements', () => {
    beforeEach(() => {
      p1Rack = game.players[0].getRack();
      game.board.squares = game.board.getSquares();
    });

    it('returns false if the tiles placed during the current tile are not all in the same row or column', () => {
      game.placeTile(1, 0, p1Rack, 1);
      game.placeTile(0, 2, p1Rack, 2);
      game.placeTile(1, 3, p1Rack, 3);
      expect(game.validateTilePlacements()).to.deep.equal(false);
    });
  });
});