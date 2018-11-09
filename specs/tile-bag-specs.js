const TileBag = require('../src/tile-bag.js');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('TileBag', () => {
  describe('remainingTilesCount', () => {
    it('should return the number of tiles left in the tile bag', () => {
      let tileBag = new TileBag;
      expect(tileBag.remainingTilesCount()).to.deep.equal(100);
    });   
  });

  describe('shuffle', () => {
    it('should shuffle the tiles into a random order', () => {
      var callback = sinon.stub();    
      callback.onCall(0).returns(0.1);     
      callback.onCall(1).returns(0.5);     
      callback.returns(0.4);        
      let tileBag = new TileBag(callback);
      tileBag.shuffle();
      expect(tileBag.tiles[99].letter).to.deep.equal('B');
    });
  });
});