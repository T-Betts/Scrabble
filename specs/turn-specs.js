const Board = require('../src/board.js');
const Player = require('../src/player.js');
const Tile = require('../src/tile.js');
const TileBag = require('../src/tile-bag.js');
const Turn = require('../src/turn.js');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('Turn', () => {
  let turnOne;
  let turnTwo;
  let turnThree;
  let playerOneRack;
  let playerTwoRack;
  let playerThreeRack;

  beforeEach(() => {
    let playerOneStub = sinon.createStubInstance(Player, {
      getId: 1, 
      getRack: [
        {letter: 'A', value: 1}, {letter: 'T', value: 1}, {letter: 'E', value: 1},
        {letter: 'C', value: 3}, {letter: 'R', value: 1}, {letter: 'S', value: 1}, {letter: '-'}
      ]
    });
    let playerTwoStub = sinon.createStubInstance(Player, {
      getId: 2, 
      getRack: [
        {letter: 'A', value: 1}, {letter: 'T', value: 1}, {letter: 'E', value: 1},
        {letter: 'C', value: 3}, {letter: 'R', value: 1}, {letter: 'S', value: 1}, {letter: 'R', value: 1}
      ]
    });
    let playerThreeStub = sinon.createStubInstance(Player, {
      getId: 3, 
      getRack: [
        {letter: 'A', value: 1}, {letter: 'T', value: 1}, {letter: 'E', value: 1},
        {letter: 'C', value: 3}, {letter: 'R', value: 1}, {letter: 'S', value: 1}, {letter: 'R', value: 1}
      ]
    });

    let boardStub = sinon.createStubInstance(Board, {
      getSquares: [
        [{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'}],
        [{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'}],
        [{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'}],
        [{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'}],
        [{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'}],
        [{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'}],
        [{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'},{letter: '-'}],
        ],
      getBonusSquares: {
        doubleWord: {indices: [[3, 1]], symbol: '2'},
        doubleLetter: {indices: [[1, 3]], symbol: 'd'},
        tripWord: {indices: [[3, 5]], symbol: '3'},
        tripLetter: {indices: [[5, 3]], symbol: 't'}
      },
      getCentreSquareCoordinates: [3, 3]
    });

    let createTileStub = (letter, value) => {
      return sinon.createStubInstance(Tile, {getLetter: letter, getValue: value});
    };

    let tileBagStub = sinon.createStubInstance(TileBag, {
      showRemainingTiles: [{letter: 'A', value: 1}, {letter: 'T', value: 1}],
      getTileTypes: [{letter: 'A', value: 1, count: 9}, {letter: 'T', value: 1, count: 6}],
      getCreateTile: createTileStub
    });

    let dictionary = ['exists', 'cat', 'car', 'set', 'ta', 'at'];

    turnOne = new Turn(playerOneStub, boardStub, tileBagStub, 1, dictionary);
    turnOne.board.squares = turnOne.board.getSquares();
    playerOneRack = turnOne.player.getRack();

    turnTwo = new Turn(playerTwoStub, boardStub, tileBagStub, 2, dictionary);
    turnTwo.board.squares = turnOne.board.squares;
    playerTwoRack = turnTwo.player.getRack();

    turnThree = new Turn(playerThreeStub, boardStub, tileBagStub, 3, dictionary);
    turnThree.board.squares = turnTwo.board.squares;
    playerThreeRack = turnThree.player.getRack();
  });

  describe('checkWordExists', () => {
    it('should return true if a given word is in the dictionary', () => {
      expect(turnOne.checkWordExists('exists')).to.deep.equal(true);
    });

    it('should return false if a given word is not in the dictionary', () => {
      expect(turnOne.checkWordExists('notaword')).to.deep.equal(false);
    });
  });

  describe('placeTile', () => {
    beforeEach(() => {
      turnOne.placeTile(0, 0, 5);
    });

    it('should place a tile in a designated square on the board', () => {  
      expect(turnOne.board.squares[0][0].letter).to.deep.equal("S");
    });

    it('should remove the placed tile from the current players rack', () => {
      expect(playerOneRack).to.deep.equal([{letter: 'A', value: 1}, {letter: 'T', value: 1},
      {letter: 'E', value: 1}, {letter: 'C', value: 3}, {letter: 'R', value: 1}, {letter: '-'}, {letter: '-'}]);
    });

    it('should log the coordinates of the placed tiles for the current turn', () => {
      expect(turnOne.tilesCoordinates).to.deep.equal([[0,0]]);
    });

    it('should throw error if trying to place a tile in an already occupied square', () => {
      expect(() => {turnOne.placeTile(0, 0, 2)}).to.throw('Square already occupied.');
    });

    it('should throw an error if trying to use an empty rack space', () => {
      expect(() => {turnOne.placeTile(1, 1, 6)}).to.throw('Selected rack space does not contain a tile.');
    });
  });

  describe('removeTile', () => {
    it('removes a tile from a designated normal square', () => {
      turnOne.placeTile(1, 1, 1);
      turnOne.removeTile(1, 1, 1);
      expect(turnOne.board.squares[1][1].letter).to.deep.equal('-');
    });

    it('removes a tile from a designated double word square', () => {
      turnOne.placeTile(3, 1, 1);
      turnOne.removeTile(3, 1, 1);
      expect(turnOne.board.squares[3][1].letter).to.deep.equal('2');
    });

    it('removes a tile from a designated double letter square', () => {
      turnOne.placeTile(1, 3, 1);
      turnOne.removeTile(1, 3, 1);
      expect(turnOne.board.squares[1][3].letter).to.deep.equal('d');
    });

    it('removes a tile from a designated triple word square', () => {
      turnOne.placeTile(3, 5, 1);
      turnOne.removeTile(3, 5, 1);
      expect(turnOne.board.squares[3][5].letter).to.deep.equal('3');
    });

    it('removes a tile from a designated triple letter square', () => {
      turnOne.placeTile(5, 3, 1);
      turnOne.removeTile(5, 3, 1);
      expect(turnOne.board.squares[5][3].letter).to.deep.equal('t');
    });

    it('should throw error if designated square does not contain tile letter placed during current turn', () => {
      expect(() => {turnOne.removeTile(0, 0, 1)}).to.throw('No tile placed in this square during current turn.');
    });

    it('should return removed tile to the current players rack', () => {
      turnOne.placeTile(1, 0, 1);
      turnOne.removeTile(1, 0, 1);
      expect(playerOneRack[1].getLetter()).to.deep.equal('T');
    });

    it('should remove chosen coordinates from current turn\'s tilesCoordinates array', () => {
      turnOne.placeTile(1, 0, 1);
      turnOne.removeTile(1, 0, 1);
      expect(turnOne.tilesCoordinates.length).to.deep.equal(0);
    });
  });

  describe('sortTilesCoordinatesArray', () => {
    it('should sort the tiles into correct order for horizontal words', () => {
      turnOne.placeTile(1, 3, 1);
      turnOne.placeTile(1, 1, 3);
      turnOne.placeTile(1, 2, 2);
      turnOne.sortTileCoordinatesArray('horizontal');
      expect(turnOne.tilesCoordinates).to.deep.equal([[1, 1], [1, 2], [1, 3]]);
    });

    it('should sort the tiles into correct order for vertical words', () => {
      turnOne.placeTile(3, 1, 1);
      turnOne.placeTile(1, 1, 3);
      turnOne.placeTile(2, 1, 2);
      turnOne.sortTileCoordinatesArray('vertical');
      expect(turnOne.tilesCoordinates).to.deep.equal([[1, 1], [2, 1], [3, 1]]);
    });
  });

  describe('validateTilePlacements', () => {
    it('throws error if the tiles placed during the current tile are not all in the same row or column', () => {
      turnOne.placeTile(1, 0, 1);
      turnOne.placeTile(3, 3, 2);
      turnOne.placeTile(1, 3, 3);
      expect(() => {turnOne.validateTilePlacements()}).to.throw("Invalid move. Tiles must all be in same row or column.");
    });

    it('throws error if there is a non-letter space between tiles that are all placed in the same row', () => {
      turnOne.placeTile(3, 0, 1);
      turnOne.placeTile(3, 2, 2);
      turnOne.placeTile(3, 3, 3);
      expect(() => {turnOne.validateTilePlacements()}).to.throw('Invalid move. No non-letter spaces between placed tiles allowed.');
    });

    it('throws error if there is a non-letter space between tiles that are all placed in the same column', () => {
      turnOne.placeTile(0, 3, 1);
      turnOne.placeTile(3, 3, 2);
      turnOne.placeTile(2, 3, 3);
      expect(() => {turnOne.validateTilePlacements()}).to.throw('Invalid move. No non-letter spaces between placed tiles allowed.');
    });

    it('returns true if tiles are all in same row and there are no non-letter spaces between them', () => {
      turnOne.placeTile(3, 1, 1);
      turnOne.placeTile(3, 3, 2);
      turnOne.placeTile(3, 2, 3);
      expect(turnOne.validateTilePlacements()).to.deep.equal(true);
    });

    it('returns true if tiles are all in same column and there are no non-letter spaces between them', () => {
      turnOne.placeTile(1, 3, 1);
      turnOne.placeTile(2, 3, 2);
      turnOne.placeTile(3, 3, 3);
      expect(turnOne.validateTilePlacements()).to.deep.equal(true);
    });

    it('should throw an error if just one tile has been placed in the first turn', () => {
      turnOne.placeTile(3, 3, 2);
      expect(() => {turnOne.validateTilePlacements()}).to.throw('Words must be longer than one letter.');
    });

    it('should throw an error if no tiles have been placed in the current turn', () => {
      expect(() => {turnOne.validateTilePlacements()}).to.throw('No tiles placed.');
    });

    it('should throw error if first turn of game does not use centre square', () => {
      turnOne.placeTile(1, 1, 1);
      turnOne.placeTile(3, 1, 2);
      turnOne.placeTile(2, 1, 3);
      expect(() => {turnOne.validateTilePlacements()}).to.throw('First move must use centre square.');
    });

    it('throws an error if no tiles from the current turn connect with a tile from a previous turn', () => {
      turnOne.placeTile(3, 3, 1);
      turnTwo.placeTile(0, 0, 0)
      turnTwo.placeTile(0, 1, 1)
      expect(() => {turnTwo.validateTilePlacements()}).to.throw('Invalid move. Must connect to previous moves.');
    });
  });

  describe('selectBoardSection', () => {
    let tilesCoordinates;

    beforeEach(() => {
      turnOne.board.squares[2][1] = {letter: 'G'};
      turnOne.board.squares[2][2] = {letter: 'A'};
      turnOne.board.squares[1][1] = {letter: 'M'};
      turnOne.board.squares[4][1] = {letter: 'E'};
      turnOne.board.squares[2][4] = {letter: 'S'};
    });

    it('should return a horizontal section of the board between two squares', () => {
      tilesCoordinates = [[2, 1], [2, 2], [2, 4]];
      expect(turnOne.selectBoardSection('horizontal', tilesCoordinates)).to.deep.equal([{letter: 'G'}, {letter: 'A'}, {letter: '-'}, {letter: 'S'}]);
    });

    it('should return a vertical section of the board between two squares', () => {
      tilesCoordinates = [[1, 1], [2, 1], [4, 1]];
      expect(turnOne.selectBoardSection('vertical', tilesCoordinates)).to.deep.equal([{letter: 'M'}, {letter: 'G'}, {letter: '-'}, {letter: 'E'}]);
    });

    it('should return a single square if only one tile was placed', () => {
      tilesCoordinates = [[1, 1]];
      expect(turnOne.selectBoardSection('oneTile', tilesCoordinates)).to.deep.equal([{letter: 'M'}]);
    });
  });

  describe('getTilesNeighbourSquares', () => {
    it('should return four squares for a square not at the edge of the board', () => {
      expect(turnOne.getTilesNeighbourSquares([3, 3])).to.deep.equal([[2,3],[4,3],[3,2],[3,4]]);
    });

    it('should return two squares for a square in the corner of the board', () => {
      expect(turnOne.getTilesNeighbourSquares([0, 0])).to.deep.equal([[1,0],[0,1]]);
    });

    it('should return three squares for a square at the edge of the board', () => {
      expect(turnOne.getTilesNeighbourSquares([2, 0])).to.deep.equal([[1,0],[3,0],[2,1]]);
    });
  });

  describe('getWordsNeighbourSquares', () => {
    it('should return all the potential neighbouring squares of a word', () => {
      turnOne.placeTile(1, 2, 2);
      turnOne.placeTile(3, 3, 3);
      turnOne.placeTile(3, 2, 4);
      expect(turnOne.getWordsNeighbourSquares().length).to.deep.equal(12);
    });
  });

  describe('checkWordConnects', () => {
    it('should return true if the current turn touches a previously placed word', () => {
      turnOne.placeTile(3, 3, 1);
      turnTwo.placeTile(3, 2, 2);
      expect(turnTwo.checkWordConnects()).to.deep.equal(true);
    });

    it('should return false if the current turn does not touch a previously placed word', () => {
      turnOne.placeTile(3, 3, 1);
      turnTwo.placeTile(0, 0, 2);
      expect(turnTwo.checkWordConnects()).to.deep.equal(false);
    });
  });

  describe('collectHorizontalAdjacentTiles', () => {
    it('should log the coordinates of all the adjacent horizontal tiles for a given tile and the tile itself, in order', () => {
      turnOne.placeTile(3, 4, 0);
      turnOne.placeTile(3, 3, 2);
      turnOne.validateTilePlacements();
      turnOne.collectHorizontalAdjacentTiles(turnOne.tilesCoordinates[0]);
      expect(turnOne.allWordsCoordinates).to.deep.equal([[[3, 3], [3, 4]]]);
    });

    it('should throw error if called when no tiles have been placed during current move', () => {
      expect(() => {turnOne.collectHorizontalAdjacentTiles(turnOne.tilesCoordinates[0])}).to.throw('No words to collect as no tiles have been placed this turn.');
    });
  });

  describe('collectVerticalAdjacentTiles', () => {
    it('should log the coordinates of all the adjacent vertical tiles for a given tile and the tile itself, in order', () => {
      turnOne.placeTile(2, 3, 0);
      turnOne.placeTile(1, 3, 2);
      turnOne.placeTile(0, 3, 1);
      turnOne.placeTile(3, 3, 3);
      turnOne.validateTilePlacements();
      turnOne.collectVerticalAdjacentTiles(turnOne.tilesCoordinates[0]);
      expect(turnOne.allWordsCoordinates).to.deep.equal([[[0, 3], [1, 3], [2, 3], [3, 3]]]);
    });

    it('should throw error if called when no tiles have been placed during current move', () => {
      expect(() => {turnOne.collectVerticalAdjacentTiles(turnOne.tilesCoordinates[0])}).to.throw('No words to collect as no tiles have been placed this turn.');
    });
  });

  describe('collectCurrentTurnWordsCoordinates', () => {
    it('should collect all the words formed by a side by side vertical move, in coordinate form', () => {
      turnOne.placeTile(3, 3, 0);
      turnOne.placeTile(1, 3, 2);
      turnOne.placeTile(0, 3, 1);
      turnOne.placeTile(2, 3, 3);

      turnTwo.placeTile(2, 2, 0);
      turnTwo.placeTile(1, 2, 2);
      turnTwo.placeTile(0, 2, 1);
      turnTwo.validateTilePlacements();
      turnTwo.collectCurrentTurnWordsCoordinates(turnTwo.tilesCoordinates[0]);
      expect(turnTwo.allWordsCoordinates).to.deep.equal([
        [[0, 2], [1, 2], [2, 2]],
        [[0, 2], [0, 3]],
        [[1, 2], [1, 3]],
        [[2, 2], [2, 3]]
      ]);
    });

    it('should collect all the words formed by a side by side horizontal move, in coordinate form', () => {
      turnOne.placeTile(3, 4, 0);
      turnOne.placeTile(3, 3, 2);
      turnOne.placeTile(3, 1, 1);
      turnOne.placeTile(3, 2, 3);

      turnTwo.placeTile(4, 3, 0);
      turnTwo.placeTile(4, 2, 2);
      turnTwo.placeTile(4, 4, 1);
      turnTwo.validateTilePlacements();
      turnTwo.collectCurrentTurnWordsCoordinates(turnTwo.tilesCoordinates[0]);
      expect(turnTwo.allWordsCoordinates).to.deep.equal([
        [[4, 2], [4, 3], [4, 4]],
        [[3, 2], [4, 2]],
        [[3, 3], [4, 3]],
        [[3, 4], [4, 4]]
      ]);
    });

    it('should collect all the words formed by a single tile move, in coordinate form', () => {
      turnOne.placeTile(2, 3, 0);
      turnOne.placeTile(3, 3, 1);

      turnTwo.placeTile(3, 4, 0);
      turnTwo.placeTile(3, 5, 1);

      turnThree.placeTile(2, 4, 4);
      turnThree.validateTilePlacements();
      turnThree.collectCurrentTurnWordsCoordinates(turnThree.tilesCoordinates[0]);
      expect(turnThree.allWordsCoordinates).to.deep.equal([
        [[2, 3], [2, 4]],
        [[2, 4], [3, 4]]
      ]);
    });

    it('should remove any one-letter words from allWordsCoordinates', () => {
      turnOne.placeTile(2, 3, 5);
      turnOne.placeTile(3, 3, 2);

      turnTwo.placeTile(4, 1, 3);
      turnTwo.placeTile(4, 2, 0);
      turnTwo.placeTile(4, 3, 1);
      turnTwo.validateTilePlacements();
      turnTwo.collectCurrentTurnWordsCoordinates(turnTwo.tilesCoordinates[0]);
      expect(turnTwo.allWordsCoordinates).to.deep.equal([[[4, 1], [4, 2], [4, 3]], [[2, 3], [3, 3], [4, 3]]]);
    });
  });

  describe('getCurrentTurnsWords', () => {
    it('should return true if every word formed by the current turn exists', () => {
      turnOne.placeTile(2, 3, 5);
      turnOne.placeTile(3, 3, 2);
  
      turnTwo.placeTile(4, 1, 3);
      turnTwo.placeTile(4, 2, 0);
      turnTwo.placeTile(4, 3, 1);
      turnTwo.validateTilePlacements();
      turnTwo.collectCurrentTurnWordsCoordinates(turnTwo.tilesCoordinates[0]);
      turnTwo.getCurrentTurnsWords();
      expect(turnTwo.words).to.deep.equal(['cat', 'set']);
    });
  });

  describe('checkAllTurnsWordsExist', () => {
    it('should return true if every word formed by the current turn exists', () => {
      turnOne.placeTile(2, 3, 5);
      turnOne.placeTile(3, 3, 2);

      turnTwo.placeTile(4, 1, 3);
      turnTwo.placeTile(4, 2, 0);
      turnTwo.placeTile(4, 3, 1);
      turnTwo.validateTilePlacements();
      turnTwo.collectCurrentTurnWordsCoordinates(turnTwo.tilesCoordinates[0]);
      turnTwo.getCurrentTurnsWords();
      expect(turnTwo.checkAllTurnsWordsExist()).to.deep.equal(true);
    });

    it('if not all the words exist, it should let you know which words are not in the dictionary', () => {
      turnOne.placeTile(1, 4, 3);
      turnOne.placeTile(2, 4, 4);

      turnTwo.placeTile(3, 3, 4);
      turnTwo.placeTile(4, 3, 1);
      turnTwo.placeTile(2, 3, 3);
      turnTwo.validateTilePlacements();
      turnTwo.collectCurrentTurnWordsCoordinates(turnTwo.tilesCoordinates[0]);
      turnTwo.getCurrentTurnsWords();
      expect(() => {turnTwo.checkAllTurnsWordsExist()}).to.throw('Invalid word(s): CRT, CR');
    });
  });

  describe('calculateScore', () => {
    it('should return the score of a non-bonus word', () => {
      turnOne.placeTile(3, 2, 3);
      turnOne.placeTile(3, 3, 0);
      turnOne.placeTile(3, 4, 1);
      turnOne.validateTilePlacements();
      turnOne.collectCurrentTurnWordsCoordinates(turnOne.tilesCoordinates[0]);
      turnOne.getCurrentTurnsWords();
      expect(turnOne.calculateScore()).to.deep.equal(5);
    });

    it('should return the correct score of a word that includes a double letter tile', () => {
      turnOne.placeTile(1, 3, 3);
      turnOne.placeTile(2, 3, 0);
      turnOne.placeTile(3, 3, 1);
      turnOne.validateTilePlacements();
      turnOne.collectCurrentTurnWordsCoordinates(turnOne.tilesCoordinates[0]);
      turnOne.getCurrentTurnsWords();
      expect(turnOne.calculateScore()).to.deep.equal(8);
    });

    it('should return the correct score of a word that includes a triple letter tile', () => {
      turnOne.placeTile(3, 3, 3);
      turnOne.placeTile(4, 3, 0);
      turnOne.placeTile(5, 3, 1);
      turnOne.validateTilePlacements();
      turnOne.collectCurrentTurnWordsCoordinates(turnOne.tilesCoordinates[0]);
      turnOne.getCurrentTurnsWords();
      expect(turnOne.calculateScore()).to.deep.equal(7);
    });
  });
});