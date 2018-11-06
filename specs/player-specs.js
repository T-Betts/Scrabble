const Player = require('../src/player.js');
const expect = require('chai').expect;

describe('Player', () => {
  describe('drawTiles', () => {
    it('should draw a given number of tiles and place them into the players rack', () => {
      let player1 = new Player(1, "Tom");
      let fakeLetterBag = {tiles: ["A", "B", "C", "D", "E"]};
      player1.drawTiles(4, fakeLetterBag);
      expect(player1.rack.length).to.deep.equal(4);
    })
  });

  describe('updateScore', () => {
    it('should change a player score by a given amount', () => {
      let player1 = new Player(1, "Tom");
      player1.updateScore(10);
      expect(player1.score).to.deep.equal(10);
    })
  })
});