const LetterBag = require('../src/letter-bag.js')
const expect = require('chai').expect

describe('LetterBag', () => {
  describe('getTile', () => {
    it('should return a tile from the letter bag', () => {
      // arrange
        let letterBag = new LetterBag
      // act
        let tile = letterBag.getTile()
      // assert
        expect(tile.letter).to.deep.equal('Blank');
    })
  })
})