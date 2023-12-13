const expect = require('chai').expect;

import UserManager from "../models/UserManager";
import User from '../models/User';
import { Failure, Success } from "../models/Result";
import GameManager from "../models/GameManager";
import Game from "../models/Game";
import { GamePlay, PlacingShips, Waiting, Winner } from "../phasesFuncs";
/*
// UserManager tests
describe('Register users', () => {
    it('should NOT register- not a valid email', async () => {
        const userManager = new UserManager();
        const result = await userManager.register('inbgmail.com', 'inbal', 'checking123');
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('Email is not valid');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should NOT register- not a valid password', async () => {
        const userManager = new UserManager();
        const result = await userManager.register('inbalJustChecking@gmail.com', 'inbal', 'che23');
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('Password must be at least 8 characters');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should NOT register- email already exist', async () => {
        const userManager = new UserManager();
        const result = await userManager.register('inbal@gmail.com', 'inbal', 'checking123');
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('Email already exist, choose a different email');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should register user', async () => {
        const userManager = new UserManager();
        const result = await userManager.register('inbalJustChecking@gmail.com', 'Inbal', 'fdsfschecking123');
        expect(result).to.be.an.instanceof(Success);
    });
});


describe('Login Authorization tests- local strategy', () => {
    it('should NOT pass auth check for log in - user not found', async () => {
        const userManager = new UserManager();
        const result = await userManager.authenticate('inbalSTAM@gmail.com', 'checking123');
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('User was not found');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should NOT pass auth check for log in- passwords do not match', async () => {
        const userManager = new UserManager();
        const result = await userManager.authenticate('inbal@gmail.com', 'cddschecking123');
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('Passwords did not match');
        expect(result).to.have.property("status").to.equal(401);
    });

    it('should pass auth check for log in', async () => {
        const userManager = new UserManager();
        const result = await userManager.authenticate('inbalJustChecking@gmail.com', 'fdsfschecking123');
        expect(result).to.be.an.instanceof(Success);
        expect(result).to.have.property("result").to.have.property("id").to.equal(10);
        expect(result).to.have.property("result").to.have.property("username").to.equal('inbalJustChecking@gmail.com');
    });
});


describe('Login Authorization tests- google strategy', () => {
    it('should pass auth check for log in', async () => {
        const userManager = new UserManager();
        const result = await userManager.googleAuthenticate('google', 'just12checking34', 'inbalStam@gmail.com', 'Inbal');
        expect(result).to.be.an.instanceof(Success);
        expect(result).to.have.property("result").to.have.property("id").to.equal(11);
        expect(result).to.have.property("result").to.have.property("username").to.equal('inbalStam@gmail.com');
    });
});


describe('Get user by ID', () => {
    it('should NOT get user- wrong ID', async () => {
        const userManager = new UserManager();
        const result = await userManager.getUserById(400);
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('User was not found');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should get user', async () => {
        const userManager = new UserManager();
        const result = await userManager.getUserById(1);
        expect(result).to.be.an.instanceof(Success);
        expect(result).to.have.property("result").to.have.property("id").to.equal(1);
        expect(result).to.have.property("result").to.have.property("username").to.equal('inbal@gmail.com');
    });
});


// User tests
describe('Get user information', () => {
    it('should get user Id', () => {
        const user = new User(1, 'inbal@gmail.com', 'inbal');
        const result = user.getUserId();
        expect(result).to.be.a("number");
        expect(result).to.equal(1);
    });

    it('should get username', () => {
        const user = new User(1, 'inbal@gmail.com', 'inbal');
        const result = user.getUsername();
        expect(result).to.equal('inbal@gmail.com');
    });

    it('should get nickname', () => {
        const user = new User(1, 'inbal@gmail.com', 'inbal');
        const result = user.getNickname();
        expect(result).to.equal('inbal');
    });
});

describe('Get user game manager', () => {
    it('should get game manager', () => {
        const user = new User(1, 'inbal@gmail.com', 'inbal');
        const result = user.getGameManager();
        expect(result).to.be.an.instanceof(GameManager);
    });
});


describe('Update user profile', () => {
    it('should update profile', async () => {
        const user = new User(1, 'inbal@gmail.com', 'inbal');
        const result = await user.updateProfile(null, 'InbalNew');
        const final = (result as Success<User>).result;
        expect(final).to.be.an.instanceof(User);
        expect(final).to.have.property("nickname").to.equal('InbalNew');
    });
});


// GameManager tests
describe('Check GameManager functionality', () => {
    it('should NOT get user games- user not exists', async () => {
        const gameManager = new GameManager(500);
        const games = await gameManager.getUserGames();
        expect(games).to.be.an.instanceof(Failure);
        expect(games).to.have.property("msg").to.equal('User does not exists');
        expect(games).to.have.property("status").to.equal(400);
    });

    it('should get user games', async () => {
        const gameManager = new GameManager(1);
        const games = await gameManager.getUserGames();
        console.log(games);
        expect(games).to.be.an.instanceof(Success);
    });

    it('should NOT get game- wrong id', async () => {
        const gameManager = new GameManager(1);
        const games = await gameManager.getGameById(100);
        expect(games).to.be.an.instanceof(Failure);
        expect(games).to.have.property("msg").to.equal('Game does not exists');
        expect(games).to.have.property("status").to.equal(400);
    });

    it('should get game by Id', async () => {
        const gameManager = new GameManager(1);
        const game = await gameManager.getGameById(1);
        const final = (game as Success<Game>).result;
        expect(final).to.be.an.instanceof(Game);
        expect(final).to.have.property("id").to.equal(1);
    });

    it ('should create new game', async () => {
        const gameManager = new GameManager(1);
        const newGame = await gameManager.createGame(2, 10);
        const final = (newGame as Success<Game>).result;
        expect(final).to.be.an.instanceof(Game);
        expect(final).to.have.property("id").to.equal(23);
    });
});
*/

// Game tests
describe('Check Game class getGameInfo function', () => {
    it('should NOT get game info- state invited', async () => {
        const game = new Game(1, 1, 2, 10, 'invited');
        const gameInfo = await game.getGameInfo(1);
        expect(gameInfo).to.be.an.instanceof(Failure);
        expect(gameInfo).to.have.property("msg").to.equal('Game is in state invited');
        expect(gameInfo).to.have.property("status").to.equal(400);
    });

    it('should get game info- Waiting phase', async () => {
        const game = new Game(7, 1, 3, 10, 'user1_ready');
        const gameInfo = await game.getGameInfo(1);
        const result = gameInfo as Success<Waiting>
        expect(gameInfo).to.be.an.instanceof(Success);
        expect(result.result).to.have.property("phase").to.equal('waiting_for_other_player');
    });

    it('should get game info- Winner phase', async () => {
        const game = new Game(14, 4, 1, 10, 'user2_won');
        const gameInfo = await game.getGameInfo(4);
        const result = gameInfo as Success<Winner>
        expect(gameInfo).to.be.an.instanceof(Success);
        expect(result.result).to.have.property("phase").to.equal('finished');
        expect(result.result).to.have.property("i_won").to.equal(false);
    });

    it('should get game info- Placing pieces', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const gameInfo = await game.getGameInfo(1);
        const result = gameInfo as Success<PlacingShips>
        expect(gameInfo).to.be.an.instanceof(Success);
        expect(result.result).to.have.property("phase").to.equal('placing_pieces');
    });

    it('should get game info- Placing pieces', async () => {
        const game = new Game(2, 1, 2, 10, 'user2_turn');
        const gameInfo = await game.getGameInfo(1);
        const result = gameInfo as Success<GamePlay>
        expect(gameInfo).to.be.an.instanceof(Success);
        expect(result.result).to.have.property("phase").to.equal('gamePlay');
        expect(result.result).to.have.property("my_turn").to.equal(false);
    });
});


describe('Check Game general funcs', () => {
    it('should get game constructor data', () => {
        const game = new Game(2, 1, 2, 10, 'user2_turn');
        const gameId = game.getGameId();
        const gamePlayer = game.getPlayerId();
        const gameOpponent = game.getOpponentId();
        const gameState = game.getState();
        const gameDimension = game.getDimension();
        expect(gameId).to.equal(2);
        expect(gamePlayer).to.equal(1);
        expect(gameOpponent).to.equal(2);
        expect(gameState).to.equal('user2_turn');
        expect(gameDimension).to.equal(10);
    });
});


describe('Check Delete game', () => {
    it('should delete game', async () => {
        const game = new Game(1, 1, 2, 10, 'invited');
        const result = await game.deleteGame();
        expect(result).to.be.an.instanceof(Success);
        expect(result).to.have.property("result").to.equal('Game deleted');
    });
});


describe('Check Game update state funcs', () => {
    it('should accept game', async () => {
        const game = new Game(18, 8, 5, 10, 'invited');
        const response = await game.acceptGame();
        const result = response as Success<Game>;
        expect(response).to.be.an.instanceof(Success);
        expect(result.result).to.have.property("state").to.equal('accepted');
    });
});


describe('Check User shoot', () => {
    it('should NOT perform shot - wrong game state', async () => {
        const game = new Game(5, 1, 3, 10, 'accepted');
        const result = await game.userShoot(1, 3, 4);
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('Game is not in correct state or user not correct user');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should NOT perform shot - shot outside of board', async () => {
        const game = new Game(4, 1, 3, 10, 'user1_turn');
        const result = await game.userShoot(1, 13, 4);
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('The shot is outside of the game board');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should NOT perform shot - cell already chot', async () => {
        const game = new Game(4, 1, 3, 10, 'user1_turn');
        const result = await game.userShoot(1, 5, 2);
        expect(result).to.be.an.instanceof(Failure);
        expect(result).to.have.property("msg").to.equal('This cell was already shot');
        expect(result).to.have.property("status").to.equal(400);
    });

    it('should perform a shot', async () => {
        const game = new Game(4, 1, 3, 10, 'user1_turn');
        const result = await game.userShoot(1, 8, 9);
        expect(result).to.be.an.instanceof(Success);
        expect(result).to.have.property("result").to.equal('Player performed a shot');
    });
});


// ChatManager tests
describe('Check ChatManager functionality', () => {
    it('should get game chat', async () => {
        const game = new Game(4, 1, 3, 10, 'user1_turn');
        const chatManager = game.getGameChatManager();
        const result = await chatManager.getGameChat();
        expect(result).to.be.an.instanceof(Success);
    });

    it('should post new message to game chat', async () => {
        const game = new Game(4, 1, 3, 10, 'user1_turn');
        const chatManager = game.getGameChatManager();
        const result = await chatManager.postNewGameMsg(3, 'That was a good shot');
        expect(result).to.be.an.instanceof(Success);
        expect(result).to.have.property('result').to.equal('Sent message');
    });
});

