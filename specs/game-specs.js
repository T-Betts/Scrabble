const expect = require('chai').expect;
const sinon = require('sinon');
const Game = require('../src/game.js');
const Player = require('../src/player.js');
const Board = require('../src/board.js');
const TileBag = require('../src/tile-bag.js');

describe('Game', () => {
  let game;
  let p1Rack;
  let p2Rack;

    beforeEach(() => {
      let boardStub = sinon.createStubInstance(Board, {
        getSquares: [['-','-','-','-','-'],['-','-','-','-','-'],['-','-','-','-','-'],['-','-','-','-','-'],['-','-','-','-','-']],
        getBonusSquares: {
          doubleWord: {indices: [[0, 0]], symbol: '2'},
          doubleLetter: {indices: [[0, 1]], symbol: 'd'},
          tripWord: {indices: [[0, 2]], symbol: '3'},
          tripLetter: {indices: [[1, 0]], symbol: 't'}
        },
        getCentreSquareCoordinates: [2, 2]
      });
      let tileBagStub = sinon.createStubInstance(TileBag, {
        showRemainingTiles: [{letter: 'A', value: 1}, {letter: 'T', value: 1}],
        getTileTypes: [{letter: 'A', value: 1, count: 9}, {letter: 'T', value: 1, count: 6}]
      });
      let createPlayerStub = (name, id) => {
        return sinon.createStubInstance(Player, {getId: id, getRack: [
          {letter: 'A', value: 1}, {letter: 'T', value: 1}, {letter: 'E', value: 1},
          {letter: 'C', value: 3}, {letter: 'R', value: 1}, {letter: 'S', value: 1}, '-'
        ]});
      }
      game = new Game(['A', 'B', 'C'], createPlayerStub, boardStub, tileBagStub, ['exists']);
    });
    
  describe('switchTurn', () => {
    beforeEach(() => {
      p1Rack = game.players[0].getRack();
      game.board.squares = game.board.getSquares();
    });

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

    it('should add one to the game\'s turnID', () => {
      game.switchTurn();
      expect(game.turnID).to.deep.equal(2);
    });

    it('should push the currentTurn object into the games turnHistory property', () => {
      game.placeTile(1, 0, p1Rack, 1);
      game.switchTurn();
      expect(game.turnHistory[0]).to.deep.equal({playerID: 1, tileCoordinates: [[1, 0]]});
    });

    it('after updating turnID and playerID it should reset all data other data in the currentTurn object', () => {
      game.placeTile(1, 0, p1Rack, 1);
      game.switchTurn();
      expect(game.currentTurn).to.deep.equal({playerID: 2, tileCoordinates: []})
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
    beforeEach(() => {
      p1Rack = game.players[0].getRack();
      game.board.squares = game.board.getSquares();
      game.placeTile(0, 0, p1Rack, 1);
    });

    it('should place a tile in a designated square on the board', () => {  
      expect(game.board.squares[0][0]).to.deep.equal("T");
    });

    it('should remove the placed tile from the current players rack', () => {
      expect(p1Rack).to.deep.equal([{letter: 'A', value: 1}, '-', {letter: 'E', value: 1},
      {letter: 'C', value: 3}, {letter: 'R', value: 1}, {letter: 'S', value: 1}, '-']);
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
      expect(p1Rack).to.deep.equal([{letter: 'A', value: 1}, {letter: 'T', value: 1}, {letter: 'E', value: 1},
      {letter: 'C', value: 3}, {letter: 'R', value: 1}, {letter: 'S', value: 1}, '-']);
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
      p2Rack = game.players[1].getRack();
      game.board.squares = game.board.getSquares();
    });

    it('returns false if the tiles placed during the current tile are not all in the same row or column', () => {
      game.placeTile(1, 0, p1Rack, 1);
      game.placeTile(2, 2, p1Rack, 2);
      game.placeTile(1, 3, p1Rack, 3);
      expect(game.validateTilePlacements()).to.deep.equal(false);
    });

    it('returns false if there is a non-letter space between tiles that are all placed in the same row', () => {
      game.placeTile(2, 0, p1Rack, 1);
      game.placeTile(2, 2, p1Rack, 2);
      game.placeTile(2, 3, p1Rack, 3);
      expect(game.validateTilePlacements()).to.deep.equal(false);
    });

    it('returns false if there is a non-letter space between tiles that are all placed in the same column', () => {
      game.placeTile(0, 2, p1Rack, 1);
      game.placeTile(2, 2, p1Rack, 2);
      game.placeTile(3, 2, p1Rack, 3);
      expect(game.validateTilePlacements()).to.deep.equal(false);
    });

    it('returns true if tiles are all in same row and there are no non-letter spaces between them', () => {
      game.placeTile(2, 1, p1Rack, 1);
      game.placeTile(2, 2, p1Rack, 2);
      game.placeTile(2, 3, p1Rack, 3);
      expect(game.validateTilePlacements()).to.deep.equal(true);
    });

    it('returns true if tiles are all in same column and there are no non-letter spaces between them', () => {
      game.placeTile(1, 2, p1Rack, 1);
      game.placeTile(3, 2, p1Rack, 2);
      game.placeTile(2, 2, p1Rack, 3);
      expect(game.validateTilePlacements()).to.deep.equal(true);
    });

    it('should return true if just one tile has been placed', () => {
      game.placeTile(2, 2, p1Rack, 2);
      expect(game.validateTilePlacements()).to.deep.equal(true);
    });

    it('should throw an error if no tiles have been placed in the current turn', () => {
      expect(() => {game.validateTilePlacements()}).to.throw('No tiles placed.');
    });

    it('should throw error if first turn of game does not use centre square', () => {
      game.placeTile(1, 1, p1Rack, 1);
      game.placeTile(3, 1, p1Rack, 2);
      game.placeTile(2, 1, p1Rack, 3);
      expect(() => {game.validateTilePlacements()}).to.throw('First move must use centre square.');
    });

    it('throws an error if no tiles from the current turn connect with a tile from a previous turn', () => {
      game.placeTile(2, 2, p1Rack, 1);
      game.switchTurn();
      game.placeTile(0, 0, p2Rack, 0)
      game.placeTile(0, 1, p2Rack, 1)
      expect(() => {game.validateTilePlacements()}).to.throw('Invalid move. Must connect to previous moves.');
    });
  });

  describe('selectBoardSection', () => {
    let tileCoordinates; 

    beforeEach(() => {
      game.board.squares = game.board.getSquares();
      game.board.squares[2][1] = 'G';
      game.board.squares[2][2] = 'A';
      game.board.squares[1][1] = 'M';
      game.board.squares[4][1] = 'E';
      game.board.squares[2][4] = 'S';
    });

    it('should return a horizontal section of the board between two squares', () => {
      tileCoordinates = [[2, 1], [2, 2], [2, 4]];
      expect(game.selectBoardSection('horizontal', tileCoordinates)).to.deep.equal(['G', 'A', '-', 'S']);
    });

    it('should return a horizontal section of the board between two squares', () => {
      tileCoordinates = [[1, 1], [2, 1], [4, 1]];
      expect(game.selectBoardSection('vertical', tileCoordinates)).to.deep.equal(['M', 'G', '-', 'E']);
    });

    it('should return a single square if only one tile was placed', () => {
      tileCoordinates = [[1, 1]];
      expect(game.selectBoardSection('oneTile', tileCoordinates)).to.deep.equal(['M']);
    });
  });

  describe('getTilesNeighbourSquares', () => {
    beforeEach(() => {
      game.board.squares = game.board.getSquares();
    });

    it('should return four squares for a square at the edge of the board', () => {
      expect(game.getTilesNeighbourSquares([2, 2])).to.deep.equal([[1,2],[3,2],[2,1],[2,3]]);
    });

    it('should return two squares for a square in the corner of the board', () => {
      expect(game.getTilesNeighbourSquares([0, 0])).to.deep.equal([[1,0],[0,1]]);
    });

    it('should return three squares for a square at the edge of the board', () => {
      expect(game.getTilesNeighbourSquares([2, 0])).to.deep.equal([[1,0],[3,0],[2,1]]);
    });
  });

  describe('getWordsNeighbourSquares', () => {
    beforeEach(() => {
      p1Rack = game.players[0].getRack();
      game.board.squares = game.board.getSquares();
    });

    it('should return all the potential neighbouring squares of a word', () => {
      game.placeTile(1, 2, p1Rack, 2);
      game.placeTile(2, 2, p1Rack, 3);
      game.placeTile(3, 2, p1Rack, 4);
      expect(game.getWordsNeighbourSquares().length).to.deep.equal(12);
    });
  });

  describe('checkWordConnects', () => {
    beforeEach(() => {
      p1Rack = game.players[0].getRack();
      p2Rack = game.players[1].getRack();
      game.board.squares = game.board.getSquares();
    });

    it('should return true if the current turn touches a previously placed word', () => {
      game.placeTile(2, 2, p1Rack, 1);
      game.switchTurn();
      game.placeTile(1, 2, p1Rack, 2);
      expect(game.checkWordConnects()).to.deep.equal(true);
    });

    it('should return false if the current turn does not touch a previously placed word', () => {
      game.placeTile(0, 0, p1Rack, 1);
      game.switchTurn();
      game.placeTile(1, 2, p1Rack, 2);
      expect(game.checkWordConnects()).to.deep.equal(false);
    });
  });
});