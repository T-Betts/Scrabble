const Tile = require('../src/tile.js');
const expect = require('chai').expect;

describe('Tile', () => {
  let tile;
  let blankTile;

  beforeEach(() => {
    tile = new Tile('A', 1);
    blankTile = new Tile('*', 0);
  });

  describe('getLetter', () => {
    it('should return a tile\'s letter', () => {
      expect(tile.getLetter()).to.deep.equal('A');
    });
  });

  describe('getValue', () => {
    it('should return a tile\'s value', () => {
      expect(tile.getValue()).to.deep.equal(1);
    });
  });

  describe('setBlankLetter', () => {
    it('should set the letter property of a blank tile to a given letter', () => {
      blankTile.setBlankLetter('D');
      expect(blankTile.letter).to.deep.equal('D');
    });

    it('should throw an error if called on a non-blank tile', () => {
      expect(() => {tile.setBlankLetter('Q')}).to.throw('Can\'t alter non-blank tiles.');
    });
  });

  describe('revertToBlank', () => {
    it('should restore an altered blank tile to its original state', () => {
      blankTile.setBlankLetter('T');
      blankTile.revertToBlank();
      expect(blankTile.letter).to.deep.equal('*');
    });

    it('should throw an error if called on a non-blank tile', () => {
      expect(() => {tile.revertToBlank()}).to.throw('Only blank tiles can be reset to blank.');
    });

    it('should throw an error if called on a blank tile that has not been assigned a letter', () => {
      expect(() => {blankTile.revertToBlank()}).to.throw('Tile already blank.');
    });
  });
});