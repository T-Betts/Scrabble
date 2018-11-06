const LetterBag = require('../src/letter-bag.js');
const expect = require('chai').expect;

describe('LetterBag', () => {
  describe('getTile', () => {
    it('should return a tile from the letter bag', () => {
      let letterBag = new LetterBag;
      let tile = letterBag.getTile();
      expect(tile.letter).to.deep.equal('Blank');
    });

    it('should remove a tile from the letter bag', () => {
      let letterBag = new LetterBag;
      letterBag.getTile();
      expect(letterBag.tiles.length).to.deep.equal(99);
    });
  });

  // describe('shuffle', () => {
  //   it('should shuffle the tiles in the letter bag into a random order', () => {
  //     // arrange
  //       let letterBag = new LetterBag
  //     // act
  //       letterBag.shuffle()
  //     // assert
  //       expect(letterBag.tiles.slice)
  //   });
  // });
});