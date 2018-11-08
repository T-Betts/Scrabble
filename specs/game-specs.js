const Game = require('../src/game.js');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('Game', () => {
  describe('switchTurn', () => {
    let game;
    beforeEach(function() {
      game = new Game(["A", "B", "C"]);
    });

    it('should switch the turn to the next player', () => {
      game.switchTurn();
      expect(game.currentTurn).to.deep.equal(game.players[1].id);
    });

    it('should switch turn back to player 1 after a round of turns is complete', () => {
      game.switchTurn();
      game.switchTurn();
      game.switchTurn();
      expect(game.currentTurn).to.deep.equal(game.players[0].id);
    });
  });
});