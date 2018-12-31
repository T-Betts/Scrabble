const Tile = require('../src/tile.js');
const expect = require('chai').expect;

describe('Tile', () => {
  let tile;

  beforeEach(() => {
    tile = new Tile('A', 1);
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
      let blankTile = new Tile('*', 0);
      blankTile.setBlankLetter('D');
      expect(blankTile.letter).to.deep.equal('D');
    });

    it('should throw an error if called on a non-blank tile', () => {
      expect(() => {tile.setBlankLetter('Q')}).to.throw('Can\'t alter non-blank tiles.');
    });
  });
});