const Game = require('../src/game.js');
const expect = require('chai').expect;

describe('Game', () => {
  describe('switchTurn', () => {
    it('should switch the turn to the next player', () => {
      let game = new Game(["A", "B", "C"]);
      game.switchTurn();
      expect(game.currentTurn).to.deep.equal(game.players[1].id);
    });
  });
});