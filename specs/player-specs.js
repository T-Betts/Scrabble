const Player = require('../src/player.js');
const expect = require('chai').expect;

describe('Player', () => {
  let player1;
  let fakeLetterBag;

  beforeEach(function() {
    player1 = new Player('Tom', 1);
    fakeLetterBag = [{letter: 'A'}, {letter: 'B'}, {letter: 'C'}, {letter: 'D'}, {letter: 'E'}];
  });

  describe('getId', () => {
    it('should return the players ID', () => {
      expect(player1.getId()).to.deep.equal(1);
    });
  });

  describe('drawTiles', () => {
    it('should draw a given number of tiles and place them into the players rack', () => {
      player1.drawTiles(4, fakeLetterBag);
      expect(player1.rack[3]).to.deep.equal({letter: 'B'});
    });
  });

  describe('updateScore', () => {
    it('should change a player score by a given amount', () => {
      player1.updateScore(10);
      expect(player1.score).to.deep.equal(10);
    });
  });

  describe('getRack', () => {
    it('should return a players tile rack', () => {
      player1.drawTiles(4, fakeLetterBag);
      expect(player1.getRack()).to.deep.equal([{letter: 'E'}, {letter: 'D'}, {letter: 'C'}, {letter: 'B'}, {letter: '-'}, {letter: '-'}, {letter: '-'}]);
    });
  });
});