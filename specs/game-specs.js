const expect = require('chai').expect;
const sinon = require('sinon');
const Game = require('../src/game.js');
const Player = require('../src/player.js');

describe('Game', () => {
  describe('switchTurn', () => {
    let game;
    beforeEach(function() {
      let boardStub = sinon.stub();
      let tileBagStub = sinon.stub();
      let createStub = (name, id) => {
        return sinon.createStubInstance(Player, {getId: id});
      }
      game = new Game(["A", "B", "C"], createStub, boardStub, tileBagStub);
    });

    it('should switch the turn to the next player', () => {
      game.switchTurn();
      expect(game.currentTurn).to.deep.equal(game.players[1].getId());
    });

    it('should switch turn back to player 1 after a round of turns is complete', () => {
      game.switchTurn();
      game.switchTurn();
      game.switchTurn();
      expect(game.currentTurn).to.deep.equal(game.players[0].getId());
    });
  });
});