const expect = require('chai').expect;
const sinon = require('sinon');
const Game = require('../src/game.js');
const Player = require('../src/player.js');
const Board = require('../src/board.js');
const Tile = require('../src/tile.js');
const TileBag = require('../src/tile-bag.js');
const Turn = require('../src/turn.js');

describe('Game', () => {
  let game;

  beforeEach(() => {
    let tileBagStub = sinon.createStubInstance(TileBag, {
      showRemainingTiles: [
        {letter: 'A', value: 1}, {letter: 'B', value: 3}, {letter: 'C', value: 3},
        {letter: 'D', value: 2}, {letter: 'E', value: 1}, {letter: 'F', value: 4},
        {letter: 'A', value: 1}, {letter: 'T', value: 1}, {letter: 'I', value: 1},
        {letter: 'B', value: 3}, {letter: 'Q', value: 10}, {letter: 'A', value: 1}, 
        {letter: 'T', value: 1}, {letter: 'A', value: 1}, {letter: 'T', value: 1},
      ],
    });
    let createPlayer = (name, id) => new Player(name, id);
    let createTurn = (player, startBoard, tileBag, turnID, dictionary) => new Turn(player, startBoard, tileBag, turnID, dictionary);
    game = new Game(['A', 'B', 'C'], createPlayer, new Board, tileBagStub, createTurn);
  });

  describe('playTurn', () => {
    it('should throw an error if the tile placement from the current move is invalid', () => {
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(1, 1, 1);
      expect(() => {game.playTurn()}).to.throw('Invalid move. Tiles must all be in same row or column.');
    });

    it('should collect the coordinates of all the words formed by the current turn', () => {
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(7, 6, 1);
      game.playTurn();
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(6, 6, 0);
      game.currentTurn.placeTile(6, 7, 1);
      game.playTurn();
      expect(game.turnHistory[1].allWordsCoordinates).to.deep.equal([[[6, 6], [6, 7]], [[6, 6], [7, 6]], [[6, 7], [7, 7]]]);
    });

    it('should throw error if one or more words formed in current turn are not in the dictionary', () => {
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(7, 7, 4);
      game.currentTurn.placeTile(7, 6, 0);
      expect(() => {game.playTurn()}).to.throw('Invalid word(s): TQ');
    });

    it('should calculate the turn score', () => {
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(7, 6, 1);
      game.playTurn();
      expect(game.turnHistory[0].score).to.deep.equal(4)
    });

    it('should add the current turn score to the current player\'s overall score', () => {
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(7, 6, 1);
      game.playTurn();
      expect(game.players[0].score).to.deep.equal(4);
    });

    it('should switch to the next turn if current turn was legal', () => {
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(7, 6, 1);
      game.playTurn();
      expect(game.turnID).to.deep.equal(2);
    });
  });

  describe('switchTurn', () => {
    it('should add the current turn to the turnHistory', () => {
      game.switchTurn();
      expect(game.turnHistory[0].id).to.deep.equal(1);
    })

    it('should add one to the games turnID', () => {
      game.switchTurn();
      expect(game.turnID).to.deep.equal(2);
    });

    it('should create a new turn and set this as the game\'s currentTurn', () => {
      game.switchTurn();
      expect(game.currentTurn.id).to.deep.equal(2);
    });
  });
});