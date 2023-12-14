"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Result_1 = require("./Result");
const db = require("../db");
const Game_1 = require("./Game");
class GameManager {
    constructor(userId) {
        this.userId = userId;
    }
    async getUserGames() {
        let activeGames = [];
        let gameInvitations = [];
        try {
            const userScore = await db.getUserScore(this.userId);
            if (!userScore) {
                return new Result_1.Failure('User does not exists', 400);
            }
            const gamesShots = await db.getActiveGameData(this.userId, 'user1_turn', 'user2_turn');
            if (gamesShots.length > 0) {
                activeGames.push(...gamesShots);
            }
            const otherGames = await db.getOtherGamesData(this.userId, 'invited', 'accepted', 'user1_ready', 'user2_ready');
            otherGames.forEach(game => {
                if (game.state === 'invited') {
                    gameInvitations.push({
                        game_id: game.id,
                        opponent: game.opponent,
                        board_dimension: game.dimension,
                        createdByMe: game.user1 === this.userId
                    });
                }
            });
            otherGames.forEach(game => {
                if (game.state !== 'invited') {
                    activeGames.push({
                        game_id: game.id,
                        opponent: game.opponent,
                        board_dimension: game.dimension,
                        hits: 0,
                        bombed: 0
                    });
                }
            });
            const FinalResults = {
                user_score: {
                    id: userScore.id,
                    wins: userScore.wins,
                    loses: userScore.loses
                },
                invitations: gameInvitations,
                active_games: activeGames
            };
            return new Result_1.Success(FinalResults);
        }
        catch (e) {
            return new Result_1.Failure('Server error', 500);
        }
    }
    async getGameById(gameId) {
        try {
            const game = await db.getGameById(gameId);
            if (!game) {
                return new Result_1.Failure('Game does not exists', 400);
            }
            return new Result_1.Success(new Game_1.default(game.id, game.user1, game.user2, game.dimension, game.state));
        }
        catch (e) {
            return new Result_1.Failure('Server error', 500);
        }
    }
    async createGame(opponent, dimension) {
        try {
            const check = await db.getUserByUsername(opponent);
            if (!check) {
                return new Result_1.Failure('User does not exists', 400);
            }
            const timestamp = new Date(Date.now());
            const game = await db.createGame(this.userId, check.id, dimension, 'invited', timestamp);
            return new Result_1.Success(new Game_1.default(game.id, game.user1, game.user2, game.dimension, game.state));
        }
        catch (e) {
            return new Result_1.Failure('Server error', 500);
        }
    }
}
exports.default = GameManager;
