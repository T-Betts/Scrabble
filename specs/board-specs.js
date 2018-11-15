const Board = require('../src/board.js');
const expect = require('chai').expect;

describe('Board', () => {
  describe('insertBonusSquares', () => {
    let board = new Board;

    beforeEach(function() {
      board.insertBonusSquares();
    });

    it('should insert triple word squares in the correct places', () => {
      expect(board.squares[7][0]).to.deep.equal('3');
    });

    it('should insert double word squares in the correct places', () => {
      expect(board.squares[1][1]).to.deep.equal('2');
    });

    it('should insert triple letter squares in the correct places', () => {
      expect(board.squares[1][5]).to.deep.equal('t');
    });

    it('should insert double letter squares in the correct places', () => {
      expect(board.squares[14][3]).to.deep.equal('d');
    });
  });

  describe('getSquares', () => {
    it('should return all the squares on the board', () => {
      let board = new Board;
      expect(board.getSquares().length).to.deep.equal(15);
    });
  });

  describe('getBonusSquares', () => {
    it('should return the bonusSquares object', () => {
      let board = new Board;
      expect(board.getBonusSquares().tripWord.indices.length).to.deep.equal(8);
    });
  });

  describe('getCentreSquareCoordinates', () => {
    it('should return the coordinates of the boards centre square', () => {
      let board = new Board;
      expect(board.getCentreSquareCoordinates()).to.deep.equal([7, 7]);
    });
  });
});