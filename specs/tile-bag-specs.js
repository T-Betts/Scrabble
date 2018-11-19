const TileBag = require('../src/tile-bag.js');
const Tile = require('../src/tile.js');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('TileBag', () => {
  let createTileStub;
  beforeEach(() => {
    createTileStub = (letter, value) => {
      return sinon.createStubInstance(Tile, {getLetter: letter, getValue: value});
    }
  });

  describe('remainingTilesCount', () => {
    it('should return the number of tiles left in the tile bag', () => {
      let tileBag = new TileBag(createTileStub);
      expect(tileBag.remainingTilesCount()).to.deep.equal(100);
    });   
  });

  describe('shuffle', () => {
    it('should shuffle the tiles into a random order', () => {
      let callback = sinon.stub();    
      callback.onCall(0).returns(0.1);
      callback.returns(0.4);        
      let tileBag = new TileBag(createTileStub, callback);
      tileBag.shuffle();
      expect(tileBag.tiles[99].getLetter()).to.deep.equal('B');
    });
  });

  describe('showRemainingTiles', () => {
    it('should return all of the tiles left in the tile bag', () => {
      let tileBag = new TileBag(createTileStub);
      for (let i = 0; i < 95; i++) {
        tileBag.tiles.pop();
      }
      expect(tileBag.showRemainingTiles().length).to.deep.equal(5);
    });
  });

  describe('getTileTypes', () => {
    it('should return all of the tile types', () => {
      let tileBag = new TileBag;
      expect(tileBag.getTileTypes().length).to.deep.equal(27);
    });
  });

  describe('getCreateTile', () => {
    it('should return the the createTile function', () => {
      let tileBag = new TileBag(createTileStub);
      expect(typeof(tileBag.getCreateTile())).to.deep.equal('function')
    })
  });
});