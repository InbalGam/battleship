"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expect = require('chai').expect;
const UserManager_1 = require("../models/UserManager");
const User_1 = require("../models/User");
const Result_1 = require("../models/Result");
const GameManager_1 = require("../models/GameManager");
const Game_1 = require("../models/Game");
// UserManager tests
describe('Register users', () => {
    it('should NOT register- not a valid email', async () => {
        const userManager = new UserManager_1.default();
        const result = await userManager.register('inbgmail.com', 'inbal', 'checking123');
        expect(result).to.be.an.instanceof(Result_1.Failure);
        expect(result).to.have.property("msg").to.equal('Email is not valid');
        expect(result).to.have.property("status").to.equal(400);
    });
    it('should NOT register- not a valid password', async () => {
        const userManager = new UserManager_1.default();
        const result = await userManager.register('inbalJustChecking@gmail.com', 'inbal', 'che23');
        expect(result).to.be.an.instanceof(Result_1.Failure);
        expect(result).to.have.property("msg").to.equal('Password must be at least 8 characters');
        expect(result).to.have.property("status").to.equal(400);
    });
    it('should NOT register- email already exist', async () => {
        const userManager = new UserManager_1.default();
        const result = await userManager.register('inbal@gmail.com', 'inbal', 'checking123');
        expect(result).to.be.an.instanceof(Result_1.Failure);
        expect(result).to.have.property("msg").to.equal('Email already exist, choose a different email');
        expect(result).to.have.property("status").to.equal(400);
    });
    it('should register user', async () => {
        const userManager = new UserManager_1.default();
        const result = await userManager.register('inbalJustChecking@gmail.com', 'Inbal', 'fdsfschecking123');
        expect(result).to.be.an.instanceof(Result_1.Success);
    });
});
describe('Login Authorization tests- local strategy', () => {
    it('should NOT pass auth check for log in - user not found', async () => {
        const userManager = new UserManager_1.default();
        const result = await userManager.authenticate('inbalSTAM@gmail.com', 'checking123');
        expect(result).to.be.an.instanceof(Result_1.Failure);
        expect(result).to.have.property("msg").to.equal('User was not found');
        expect(result).to.have.property("status").to.equal(400);
    });
    it('should NOT pass auth check for log in- passwords do not match', async () => {
        const userManager = new UserManager_1.default();
        const result = await userManager.authenticate('inbal@gmail.com', 'cddschecking123');
        expect(result).to.be.an.instanceof(Result_1.Failure);
        expect(result).to.have.property("msg").to.equal('Passwords did not match');
        expect(result).to.have.property("status").to.equal(401);
    });
    it('should pass auth check for log in', async () => {
        const userManager = new UserManager_1.default();
        const result = await userManager.authenticate('inbalJustChecking@gmail.com', 'fdsfschecking123');
        expect(result).to.be.an.instanceof(Result_1.Success);
        expect(result).to.have.property("result").to.have.property("id").to.equal(10);
        expect(result).to.have.property("result").to.have.property("username").to.equal('inbalJustChecking@gmail.com');
    });
});
describe('Login Authorization tests- google strategy', () => {
    it('should pass auth check for log in', async () => {
        const userManager = new UserManager_1.default();
        const result = await userManager.googleAuthenticate('google', 'just12checking34', 'inbalStam@gmail.com', 'Inbal');
        expect(result).to.be.an.instanceof(Result_1.Success);
        expect(result).to.have.property("result").to.have.property("id").to.equal(11);
        expect(result).to.have.property("result").to.have.property("username").to.equal('inbalStam@gmail.com');
    });
});
describe('Get user by ID', () => {
    it('should NOT get user- wrong ID', async () => {
        const userManager = new UserManager_1.default();
        const result = await userManager.getUserById(400);
        expect(result).to.be.an.instanceof(Result_1.Failure);
        expect(result).to.have.property("msg").to.equal('User was not found');
        expect(result).to.have.property("status").to.equal(400);
    });
    it('should get user', async () => {
        const userManager = new UserManager_1.default();
        const result = await userManager.getUserById(1);
        expect(result).to.be.an.instanceof(Result_1.Success);
        expect(result).to.have.property("result").to.have.property("id").to.equal(1);
        expect(result).to.have.property("result").to.have.property("username").to.equal('inbal@gmail.com');
    });
});
// User tests
describe('Get user information', () => {
    it('should get user Id', () => {
        const user = new User_1.default(1, 'inbal@gmail.com', 'inbal');
        const result = user.getUserId();
        expect(result).to.be.a("number");
        expect(result).to.equal(1);
    });
    it('should get username', () => {
        const user = new User_1.default(1, 'inbal@gmail.com', 'inbal');
        const result = user.getUsername();
        expect(result).to.equal('inbal@gmail.com');
    });
    it('should get nickname', () => {
        const user = new User_1.default(1, 'inbal@gmail.com', 'inbal');
        const result = user.getNickname();
        expect(result).to.equal('inbal');
    });
});
describe('Get user game manager', () => {
    it('should get game manager', () => {
        const user = new User_1.default(1, 'inbal@gmail.com', 'inbal');
        const result = user.getGameManager();
        expect(result).to.be.an.instanceof(GameManager_1.default);
    });
});
describe('Update user profile', () => {
    it('should update profile', async () => {
        const user = new User_1.default(1, 'inbal@gmail.com', 'inbal');
        const result = await user.updateProfile(null, 'InbalNew');
        const final = result.result;
        expect(final).to.be.an.instanceof(User_1.default);
        expect(final).to.have.property("nickname").to.equal('InbalNew');
    });
});
// GameManager tests
describe('Check GameManager functionality', () => {
    it('should NOT get user games- user not exists', async () => {
        const gameManager = new GameManager_1.default(500);
        const games = await gameManager.getUserGames();
        expect(games).to.be.an.instanceof(Result_1.Failure);
        expect(games).to.have.property("msg").to.equal('User does not exists');
        expect(games).to.have.property("status").to.equal(400);
    });
    it('should get user games', async () => {
        const gameManager = new GameManager_1.default(1);
        const games = await gameManager.getUserGames();
        console.log(games);
        expect(games).to.be.an.instanceof(Result_1.Success);
    });
    it('should NOT get game- wrong id', async () => {
        const gameManager = new GameManager_1.default(1);
        const games = await gameManager.getGameById(100);
        expect(games).to.be.an.instanceof(Result_1.Failure);
        expect(games).to.have.property("msg").to.equal('Game does not exists');
        expect(games).to.have.property("status").to.equal(400);
    });
    it('should get game by Id', async () => {
        const gameManager = new GameManager_1.default(1);
        const game = await gameManager.getGameById(1);
        const final = game.result;
        expect(final).to.be.an.instanceof(Game_1.default);
        expect(final).to.have.property("id").to.equal(1);
    });
    it('should create new game', async () => {
        const gameManager = new GameManager_1.default(1);
        const newGame = await gameManager.createGame(2, 10);
        const final = newGame.result;
        expect(final).to.be.an.instanceof(Game_1.default);
        expect(final).to.have.property("id").to.equal(23);
    });
});
