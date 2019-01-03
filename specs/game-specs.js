const chai = require('chai');
chai.use(require('chai-change'));
const expect = chai.expect;
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
    randomCallback.onCall(4).returns(0.36);
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
    it('should throw an error if the game has finished', () => {
      game.shuffleAndDraw();
      for (let i = 0; i < 79; i++) {
        game.tileBag.showRemainingTiles().pop();
      }
      game.currentTurn.placeTile(7, 4, 4);
      game.currentTurn.placeTile(7, 5, 3);
      game.currentTurn.placeTile(7, 6, 5);
      game.currentTurn.placeTile(7, 7, 6);
      game.currentTurn.placeTile(7, 8, 0);
      game.currentTurn.placeTile(7, 9, 1);
      game.currentTurn.placeTile(7, 10, 2);
      game.playTurn();
      game.currentTurn.placeTile(8, 7, 0);
      expect(() => {game.playTurn()}).to.throw('Game has finished.');
    });

    it('should throw an error if the tile placement from the current move is invalid', () => {
      game.shuffleAndDraw();
      game.currentTurn.player.drawMaxTiles(game.tileBag.showRemainingTiles());
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(1, 1, 1);
      expect(() => {game.playTurn()}).to.throw('Invalid move. Tiles must all be in same row or column.');
    });

    it('should collect the coordinates of all the words formed by the current turn', () => {
      game.shuffleAndDraw();
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(7, 6, 1);
      game.playTurn();
      game.currentTurn.placeTile(6, 6, 0);
      game.currentTurn.placeTile(6, 7, 1);
      game.playTurn();
      expect(game.turnHistory[1].allWordsCoordinates).to.deep.equal([[[6, 6], [6, 7]], [[6, 6], [7, 6]], [[6, 7], [7, 7]]]);
    });

    it('should throw error if one or more words formed in current turn are not in the dictionary', () => {
      game.shuffleAndDraw();
      game.currentTurn.placeTile(7, 7, 4);
      game.currentTurn.placeTile(7, 6, 0);
      expect(() => {game.playTurn()}).to.throw('Invalid word(s): TH');
    });

    it('should calculate the turn score', () => {
      game.shuffleAndDraw();
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(7, 6, 1);
      game.playTurn();
      expect(game.turnHistory[0].score).to.deep.equal(4);
    });

    it('should add the current turn score to the current player\'s overall score', () => {
      game.shuffleAndDraw();
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(7, 6, 1);
      game.playTurn();
      expect(game.players[0].score).to.deep.equal(4);
    });

    it('should switch to the next turn if current turn was legal', () => {
      game.shuffleAndDraw();
      game.currentTurn.placeTile(7, 7, 0);
      game.currentTurn.placeTile(7, 6, 1);
      game.playTurn();
      expect(game.turnID).to.deep.equal(2);
    });
  });

  describe('switchTurn', () => {
    it('should throw an error if the game has finished', () => {
      for (let i = 0; i < 6; i++) {
        game.switchTurn();
      }
      expect(() => {game.switchTurn()}).to.throw('Game has finished.');
    });

    it('should add 1 to the consecutivePassCount if the current turn was a pass', () => {
      expect(() => {game.switchTurn()}).to.alter(() => game.consecutivePassCount, {from: 0, to: 1});
    })

    it('should reset the consecutivePassCount to zero if any tiles were played in the current turn', () => {
      game.switchTurn()
      game.switchTurn()
      game.currentTurn.placeTile(7, 7, 1);
      expect(() => {game.switchTurn()}).to.alter(() => game.consecutivePassCount, {from: 2, to: 0});
    })

    it('should shuffle the tile bag', () => {
      game.switchTurn();
      expect(game.tileBag.showRemainingTiles()[76].letter).to.deep.equal('V');
    });

    it('should draw tile\'s for any empty rack space across all player racks', () => {
      game.switchTurn();
      expect(game.players[2].getRack()[6].letter).to.deep.equal('Z');
    });

    it('should add the current turn to the turnHistory', () => {
      game.switchTurn();
      expect(game.turnHistory[0].id).to.deep.equal(1);
    });

    it('should add one to the games turnID', () => {
      game.switchTurn();
      expect(game.turnID).to.deep.equal(2);
    });

    it('should create a new turn and set this as the game\'s currentTurn', () => {
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
      expect(() => {game.shuffleAndDraw()}).to.alter(() => game.tileBag.showRemainingTiles().length, { from: 100, to: 79 });
    })
  });

  describe('exchangeTurn', () => {
    it('should throw an error if the game has finished', () => {
      for (let i = 0; i < 6; i++) {
        game.switchTurn();
      }
      expect(() => {game.exchangeTurn([1, 4])}).to.throw('Game has finished.');
    });

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

  describe('checkStatus', () => {
    it('should end the game if the tile bag is empty and a player has cleared their rack', () => {
      game.shuffleAndDraw();
      for (let i = 0; i < 79; i++) {
        game.tileBag.showRemainingTiles().pop();
      }
      game.currentTurn.placeTile(7, 4, 4);
      game.currentTurn.placeTile(7, 5, 3);
      game.currentTurn.placeTile(7, 6, 5);
      game.currentTurn.placeTile(7, 7, 6);
      game.currentTurn.placeTile(7, 8, 0);
      game.currentTurn.placeTile(7, 9, 1);
      game.currentTurn.placeTile(7, 10, 2);
      expect(() => {game.checkStatus()}).to.alter(() => game.isComplete, {from: false, to: true});
    });

    it('should end the game if all players have passed twice in consecutive turns', () => {
      game.switchTurn();
      game.switchTurn();
      game.switchTurn();
      game.switchTurn();
      game.switchTurn();
      game.switchTurn();
      expect(() => {game.switchTurn()}).to.throw('Game has finished.');
    });
  });

  describe('calculateFinalScores', () => {
    beforeEach(() => {
      game.shuffleAndDraw();
      for (let i = 0; i < 79; i++) {
        game.tileBag.showRemainingTiles().pop();
      }
      game.currentTurn.placeTile(7, 4, 4);
      game.currentTurn.placeTile(7, 5, 3);
      game.currentTurn.placeTile(7, 6, 5);
      game.currentTurn.placeTile(7, 7, 6);
      game.currentTurn.placeTile(7, 8, 0);
      game.currentTurn.placeTile(7, 9, 1);
      game.currentTurn.placeTile(7, 10, 2);
      game.switchTurn();
    });

    it('should reduce a players score by the points total of the tiles left in their rack', () => {  
      expect(() => {game.calculateFinalScores()}).to.alter(() => game.players[1].score,{by: -15});
    });

    it('should add the rack totals of players to the score of the player who cleared their rack', () => {
      expect(() => {game.calculateFinalScores()}).to.alter(() => game.players[0].score, {by: +38});
    });
  });
});