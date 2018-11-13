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
      let callback = sinon.stub();    
      callback.onCall(0).returns(0.1);
      callback.returns(0.4);        
      let tileBag = new TileBag(callback);
      tileBag.shuffle();
      expect(tileBag.tiles[99].letter).to.deep.equal('B');
    });
  });

  describe('showRemainingTiles', () => {
    it('should return all of the tiles left in the tile bag', () => {
      let tileBag = new TileBag;
      for (let i = 0; i < 99; i++) {
        tileBag.tiles.pop();
      }
      expect(tileBag.showRemainingTiles()).to.deep.equal([{letter: 'A', val: 1}]);
    });
  });

  describe('getTileTypes', () => {
    it('should return all of the tile types', () => {
      let tileBag = new TileBag;
      expect(tileBag.getTileTypes().length).to.deep.equal(27);
    });
  });
});