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
    let randomCallback = sinon.stub();    
    randomCallback.onCall(0).returns(0.81);
    randomCallback.onCall(1).returns(0.01);
    randomCallback.onCall(2).returns(0.82);
    randomCallback.onCall(3).returns(0.02);
    randomCallback.onCall(4).returns(0.72);
    randomCallback.onCall(5).returns(0.1);
    randomCallback.onCall(6).returns(0.39);
    randomCallback.onCall(7).returns(0.9);
    randomCallback.onCall(8).returns(0.03);
    randomCallback.onCall(9).returns(0.33);
    randomCallback.onCall(10).returns(0.2);
    randomCallback.onCall(11).returns(0.15);
    randomCallback.onCall(12).returns(0.13);
    randomCallback.onCall(13).returns(0.12);
    randomCallback.onCall(14).returns(0.04);
    randomCallback.returns(0.4); 
    let createPlayer = (name, id) => new Player(name, id);
    let createTurn = (player, startBoard, tileBag, turnID, dictionary) => new Turn(player, startBoard, tileBag, turnID, dictionary);
    game = new Game(['A', 'B', 'C'], createPlayer, new Board, new TileBag((letter, value) => new Tile(letter, value), randomCallback), createTurn);
  });

  describe('playTurn', () => {
    it('should throw an error if the tile placement from the current move is invalid', () => {
      game.shuffleAndDraw();
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(1, 1, 1);
      expect(() => {game.playTurn()}).to.throw('Invalid move. Tiles must all be in same row or column.');
    });

    it('should collect the coordinates of all the words formed by the current turn', () => {
      game.shuffleAndDraw();
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
      game.shuffleAndDraw();
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(7, 7, 4);
      game.currentTurn.placeTile(7, 6, 0);
      expect(() => {game.playTurn()}).to.throw('Invalid word(s): TQ');
    });

    it('should calculate the turn score', () => {
      game.shuffleAndDraw();
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(7, 6, 1);
      game.playTurn();
      expect(game.turnHistory[0].score).to.deep.equal(4);
    });

    it('should add the current turn score to the current player\'s overall score', () => {
      game.shuffleAndDraw();
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(7, 6, 1);
      game.playTurn();
      expect(game.players[0].score).to.deep.equal(4);
    });

    it('should switch to the next turn if current turn was legal', () => {
      game.shuffleAndDraw();
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(7, 6, 1);
      game.playTurn();
      expect(game.turnID).to.deep.equal(2);
    });
  });

  describe('switchTurn', () => {
    it('should shuffle the tile bag', () => {
      game.switchTurn();
      expect(game.tileBag.showRemainingTiles()[76].letter).to.deep.equal('V');
    });

    it('should draw tile\'s for any empty rack space across all player racks', () => {
      game.switchTurn();
      expect(game.players[2].getRack()[6].letter).to.deep.equal('Z');
    });

    it('should add the current turn to the turnHistory', () => {
      game.shuffleAndDraw();
      game.switchTurn();
      expect(game.turnHistory[0].id).to.deep.equal(1);
    });

    it('should add one to the games turnID', () => {
      game.shuffleAndDraw();
      game.switchTurn();
      expect(game.turnID).to.deep.equal(2);
    });

    it('should create a new turn and set this as the game\'s currentTurn', () => {
      game.shuffleAndDraw();
      game.switchTurn();
      expect(game.currentTurn.id).to.deep.equal(2);
    });
  });

  describe('shuffleAndDraw', () => {
    it('should shuffle the tile bag', () => {
      game.shuffleAndDraw();
      expect(game.tileBag.showRemainingTiles()[78].letter).to.deep.equal('G')
    });

    it('should draw tile\'s for any empty rack space across all player racks', () => {
      game.shuffleAndDraw();
      expect(game.tileBag.showRemainingTiles().length).to.deep.equal(79);
    })
  });

  describe('exchangeTurn', () => {
    it('should replace desingated tiles in a players rack with tiles from the tile bag', () => {
      game.shuffleAndDraw();
      game.exchangeTurn([0, 1, 6]);
      expect(game.players[0].getRack()[0].letter).to.deep.equal('G');
      expect(game.players[0].getRack()[1].letter).to.deep.equal('S');
      expect(game.players[0].getRack()[6].letter).to.deep.equal('V');
    });

    it('should place designated removed tiles from a players rack into the tile bag', () => {
      game.shuffleAndDraw();
      game.exchangeTurn([0, 1, 6]);
      expect(game.tileBag.showRemainingTiles().length).to.deep.equal(79);
    });

    it('should throw an error if there are fewer than 7 tiles left in the tile bag', () => {
      game.shuffleAndDraw();
      for (let i = 0; i < 73; i++) {
        game.tileBag.showRemainingTiles().pop();
      }
      expect(() => {game.exchangeTurn([0, 6])}).to.throw('Cannot exchange tiles when there are fewer than 7 tiles left in tile bag.');
    });

    it('should call switchTurn after exchanging tiles', () => {
      game.shuffleAndDraw();
      game.exchangeTurn([0, 1, 6]);
      expect(game.players[0].getRack()[6].letter).to.deep.equal('V');
      expect(game.currentTurn.player.id).to.deep.equal(2);
    });
  });
});