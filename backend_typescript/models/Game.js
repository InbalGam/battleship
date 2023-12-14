"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Result_1 = require("./Result");
const pf = require("../phasesFuncs");
const db = require("../db");
const ships_1 = require("../ships");
const ShipManager_1 = require("./ShipManager");
const ChatManager_1 = require("./ChatManager");
class Game {
    constructor(id, user1, user2, dimension, state) {
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
        this.dimension = dimension;
        this.state = state;
    }
    getGameId() {
        return this.id;
    }
    getPlayerId() {
        return this.user1;
    }
    getOpponentId() {
        return this.user2;
    }
    getDimension() {
        return this.dimension;
    }
    getState() {
        return this.state;
    }
    getGameShipManager(reqUserId) {
        if (this.state === 'accepted' || this.state === 'user1_ready' || this.state === 'user2_ready') {
            return new ShipManager_1.default(this.id, reqUserId);
        }
        else {
            return 'Game is not in correct state to get ShipManager';
        }
    }
    getGameChatManager() {
        return new ChatManager_1.default(this.id);
    }
    async getGameInfo(reqUserId) {
        let result;
        try {
            const gameDetails = await db.getGameById(this.id);
            if (gameDetails.state === 'invited') {
                return new Result_1.Failure('Game is in state invited', 400);
            }
            ;
            let gameUser;
            let gamePlayer;
            let gameOpponent;
            if (gameDetails.user1 === reqUserId) {
                gameUser = 'user1'; //string
                gamePlayer = gameDetails.user1;
                gameOpponent = gameDetails.user2; //id
            }
            else {
                gameUser = 'user2'; //string
                gamePlayer = gameDetails.user2;
                gameOpponent = gameDetails.user1; //id
            }
            ;
            const opponentsInformation = await db.getUserById(gameOpponent);
            const playersInformation = await db.getUserById(gamePlayer);
            if (gameDetails.user1 === reqUserId && gameDetails.state === 'user1_ready' || gameDetails.user2 === reqUserId && gameDetails.state === 'user2_ready') {
                // waiting_for_other_player phase
                result = pf.waitingForPlayer(gameDetails, opponentsInformation, playersInformation);
            }
            else if (gameDetails.state === 'user1_won' || gameDetails.state === 'user2_won') {
                // winner phase
                result = pf.winnerPhase(gameDetails, gameUser, opponentsInformation, playersInformation);
            }
            else if (gameDetails.state === 'accepted' || (gameDetails.user1 === reqUserId && gameDetails.state === 'user2_ready') || (gameDetails.user2 === reqUserId && gameDetails.state === 'user1_ready')) {
                // placing_pieces phase
                result = await pf.placingPieces(gameDetails, this.id, reqUserId, ships_1.shipsAmount[gameDetails.dimension], opponentsInformation, playersInformation);
            }
            else if (gameDetails.state === 'user1_turn' || gameDetails.state === 'user2_turn') {
                // gamePlay phase
                result = await pf.gamePlay(gameDetails, this.id, reqUserId, gameUser, gameOpponent, opponentsInformation, playersInformation);
            }
            ;
            return new Result_1.Success(result);
        }
        catch (e) {
            return new Result_1.Failure('Server error', 500);
        }
    }
    verifyAcceptDecline(reqUserId) {
        if (reqUserId !== this.user2) {
            return 'You are not the correct opponent player';
        }
        if (this.state !== 'invited') {
            return 'Cannot accept or delete an active game';
        }
        return 'Action can be made';
    }
    async updateGameState(state) {
        this.state = state;
        const game = await db.updateGameState(this.id, this.state);
        return new Game(game.id, game.user1, game.user2, game.dimension, game.state);
    }
    async deleteGame(reqUserId) {
        const result = this.verifyAcceptDecline(reqUserId);
        if (result === 'Action can be made') {
            try {
                await db.deleteGame(this.id);
                return new Result_1.Success('Game deleted');
            }
            catch (e) {
                return new Result_1.Failure('Server error', 500);
            }
        }
        else {
            return new Result_1.Failure(result, 401);
        }
    }
    async acceptGame(reqUserId) {
        const result = this.verifyAcceptDecline(reqUserId);
        if (result === 'Action can be made') {
            try {
                const game = await this.updateGameState('accepted');
                return new Result_1.Success(game);
            }
            catch (e) {
                return new Result_1.Failure('Server error', 500);
            }
        }
        else {
            return new Result_1.Failure(result, 401);
        }
    }
    async userIsReady(reqUserId) {
        let game;
        try {
            if (this.state === 'accepted' || (this.user1 === reqUserId && this.state === 'user2_ready') || (this.user2 === reqUserId && this.state === 'user1_ready')) {
                const userShips = await db.getShipsData(this.id, reqUserId);
                if (ships_1.shipAmountDimension[this.dimension] === userShips.length) {
                    if (this.state === 'accepted' && this.user1 === reqUserId) {
                        game = await this.updateGameState('user1_ready');
                    }
                    else if (this.state === 'accepted' && this.user2 === reqUserId) {
                        game = await this.updateGameState('user2_ready');
                    }
                    else if (this.state === 'user1_ready' || this.state === 'user2_ready') {
                        const gameState = ['user1_turn', 'user2_turn'];
                        const randomChoose = Math.floor(Math.random() * 2);
                        game = await this.updateGameState(gameState[randomChoose]);
                    }
                    else {
                        console.error('Unexpected game state or user');
                        throw new Error('Unexpected game state or user');
                    }
                    return new Result_1.Success(game);
                }
                else {
                    return new Result_1.Failure('Player did not finish placeing ships', 400);
                }
            }
            else {
                return new Result_1.Failure('Game is not in correct state or user not correct user', 400);
            }
        }
        catch (e) {
            return new Result_1.Failure('Server error', 500);
        }
    }
    async performAShot(row, col, player, opponent, userTurn, userWinner, gameDimension) {
        if (row > gameDimension || row < 1 || col > gameDimension || col < 1) {
            return new Result_1.Failure('The shot is outside of the game board', 400);
        }
        const userGameShots = await db.getUserShots(this.id, player);
        const checkWasShot = userGameShots.some(shot => shot.row === row && shot.col === col);
        if (checkWasShot) {
            return new Result_1.Failure('This cell was already shot', 400);
        }
        ;
        const hitResults = await db.getHitsResults(this.id, opponent, row, col);
        if (Number(hitResults.hits) === 1) {
            const timestamp = new Date(Date.now());
            await db.insertIntoShots(this.id, player, row, col, true, timestamp);
            const successfullShots = userGameShots.filter(shot => shot.hit === true);
            if (successfullShots.length + 1 === ships_1.totalShipsSizes[gameDimension]) { // check winner
                await this.updateGameState(userWinner);
                await db.updateUsersScores(player, opponent);
                return 'Player performed a shot and won game';
            }
        }
        else {
            const timestamp = new Date(Date.now());
            await db.insertIntoShots(this.id, player, row, col, false, timestamp);
            await this.updateGameState(userTurn);
        }
        return 'Player performed a shot';
    }
    ;
    async userShoot(reqUserId, row, col) {
        let result;
        try {
            if (this.user1 === reqUserId && this.state === 'user1_turn') {
                result = await this.performAShot(row, col, this.user1, this.user2, 'user2_turn', 'user1_won', this.dimension);
            }
            else if (this.user2 === reqUserId && this.state === 'user2_turn') {
                result = await this.performAShot(row, col, this.user2, this.user1, 'user1_turn', 'user2_won', this.dimension);
            }
            else {
                return new Result_1.Failure('Game is not in correct state or user not correct user', 400);
            }
            if (result instanceof Result_1.Failure) {
                return result;
            }
            return new Result_1.Success(result);
        }
        catch (e) {
            return new Result_1.Failure('Server error', 500);
        }
    }
}
exports.default = Game;
