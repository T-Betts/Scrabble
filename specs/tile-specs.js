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
});