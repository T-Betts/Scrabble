const TileBag = require('../src/tile-bag.js');
const expect = require('chai').expect;

describe('TileBag', () => {
  describe('remainingTilesCount', () => {
    it('should return the number of tiles left in the letter bag', () => {
      let tileBag = new TileBag;
      expect(tileBag.remainingTilesCount()).to.deep.equal(100);
    });   
  });
});