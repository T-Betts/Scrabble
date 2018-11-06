const LetterBag = require('../src/letter-bag.js');
const expect = require('chai').expect;

describe('LetterBag', () => {
  describe('remainingTilesCount', () => {
    it('should return the number of tiles left in the letter bag', () => {
      let letterBag = new LetterBag;
      expect(letterBag.remainingTilesCount()).to.deep.equal(100);
    });   
  });
});