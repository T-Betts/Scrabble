const Player = require('../src/player.js');
const expect = require('chai').expect;

describe('Player', () => {
  let player1;
  let fakeLetterBag;

  beforeEach(function() {
    player1 = new Player('Tom', 1);
    fakeLetterBag = [
      {letter: 'A'}, {letter: 'B'}, {letter: 'C'},
      {letter: 'D'}, {letter: 'E'}, {letter: 'F'},
      {letter: 'G'}, {letter: 'H'}, {letter: 'I'}
    ];
  });

  describe('getId', () => {
    it('should return the players ID', () => {
      expect(player1.getId()).to.deep.equal(1);
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
      player1.drawMaxTiles(fakeLetterBag);
      expect(player1.getRack()).to.deep.equal([{letter: 'I'}, {letter: 'H'}, {letter: 'G'}, {letter: 'F'}, {letter: 'E'}, {letter: 'D'}, {letter: 'C'}]);
    });
  });

  describe('drawMaxTiles', () => {
    it('should replace all used tiles if there are enough left in the tile bag', () => {
      player1.rack[0] = {letter: 'A'}
      player1.rack[1] = {letter: 'A'}
      player1.rack[5] = {letter: 'A'}
      player1.drawMaxTiles(fakeLetterBag);
      expect(player1.getRack()).to.deep.equal([{letter: 'A'}, {letter: 'A'}, {letter: 'I'}, {letter: 'H'}, {letter: 'G'}, {letter: 'A'}, {letter: 'F'}]);
    });

    it('should replace as many tiles as possible if there aren\'t enough tiles in the tile bag', () => {
      for (let i = 0; i < 4; i++) {
        fakeLetterBag.pop();
      }
      player1.drawMaxTiles(fakeLetterBag);
      expect(player1.getRack()).to.deep.equal([{letter: 'E'}, {letter: 'D'}, {letter: 'C'}, {letter: 'B'}, {letter: 'A'}, {letter: '-'}, {letter: '-'}]);
    });
  });
});