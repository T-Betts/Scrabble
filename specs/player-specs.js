const Player = require('../src/player.js');
const expect = require('chai').expect;

describe('Player', () => {
  let player1;
  let fakeTileBag;

  beforeEach(function() {
    player1 = new Player('Tom', 1);
    fakeTileBag = [
      {letter: 'A', value: 1}, {letter: 'B', value: 3}, {letter: 'C', value: 3},
      {letter: 'D', value: 2}, {letter: 'E', value: 1}, {letter: 'F', value: 4},
      {letter: 'G', value: 2}, {letter: 'H', value: 4}, {letter: 'I', value: 1}
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
      player1.drawMaxTiles(fakeTileBag);
      expect(player1.getRack()).to.deep.equal([{letter: 'I', value: 1}, {letter: 'H', value: 4}, {letter: 'G', value: 2},
      {letter: 'F', value: 4}, {letter: 'E', value: 1}, {letter: 'D', value: 2}, {letter: 'C', value: 3}]);
    });
  });

  describe('drawMaxTiles', () => {
    it('should replace all used tiles if there are enough left in the tile bag', () => {
      player1.rack[0] = {letter: 'A', value: 1}
      player1.rack[1] = {letter: 'A', value: 1}
      player1.rack[5] = {letter: 'A', value: 1}
      player1.drawMaxTiles(fakeTileBag);
      expect(player1.getRack()).to.deep.equal([{letter: 'A', value: 1}, {letter: 'A', value: 1}, {letter: 'I', value: 1},
      {letter: 'H', value: 4}, {letter: 'G', value: 2}, {letter: 'A', value: 1}, {letter: 'F', value: 4}]);
    });

    it('should replace as many tiles as possible if there aren\'t enough tiles in the tile bag', () => {
      for (let i = 0; i < 4; i++) {
        fakeTileBag.pop();
      }
      player1.drawMaxTiles(fakeTileBag);
      expect(player1.getRack()).to.deep.equal([{letter: 'E', value: 1}, {letter: 'D', value: 2}, {letter: 'C', value: 3}, 
      {letter: 'B', value: 3}, {letter: 'A', value: 1}, {letter: '-'}, {letter: '-'}]);
    });
  });

  describe('isRackEmpty', () => {
    it('should return true if the player\'s rack is empty', () => {
      expect(player1.isRackEmpty()).to.deep.equal(true);
    })

    it('should return false if the player\'s rack is not empty', () => {
      player1.drawMaxTiles(fakeTileBag);
      expect(player1.isRackEmpty()).to.deep.equal(false);
    });
  })

  describe('getRackTotalValue', () => {
    it('should add up the total value of the tiles left in a player\'s rack', () => {
      player1.drawMaxTiles(fakeTileBag);
      expect(player1.getRackTotalValue()).to.deep.equal(17);
    });
  });
});