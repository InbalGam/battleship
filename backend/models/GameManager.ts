import { Result, Success, Failure } from "./Result";
import * as db from '../db';
import Game from "./Game";


interface InvitedGames {
    game_id: number;
    opponent: string;
    board_dimension: number;
    createdByMe: boolean;
}


export interface UserGamesList {
    user_score: db.UserScore;
    invitations: InvitedGames[];
    active_games: db.ActiveGame[];
}


export default class GameManager {
    private userId: number;
    constructor(userId: number) {
        this.userId = userId;
    }

    async getUserGames(): Promise<Result<UserGamesList>> {
        let activeGames: db.ActiveGame[] = [];
        let gameInvitations: InvitedGames[] = [];

        try {
            const userScore = await db.getUserScore(this.userId);
            if (!userScore) {
                return new Failure('User does not exists', 400);
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

            const FinalResults: UserGamesList = {
                user_score: {
                    id: userScore.id,
                    wins: userScore.wins,
                    loses: userScore.loses
                },
                invitations: gameInvitations,
                active_games: activeGames
            }

            return new Success(FinalResults);
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }

    async getGameById(gameId: number, reqUserId: number): Promise<Result<Game>> {
        try {
            const game = await db.getGameById(gameId);
            if (!game) {
                return new Failure('Game does not exists', 400);
            }
            if (game.user1 !== reqUserId && game.user2 !== reqUserId) {
                return new Failure('User not part of game', 401);
            }
            return new Success(new Game(game.id, game.user1, game.user2, game.dimension, game.state));
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }
 
    async createGame(opponent: string, dimension: number, reqUserUsername: string): Promise<Result<Game>> {
        if (dimension !== 10 && dimension !== 20) {
            return new Failure('Dimension must be 10 or 20', 400);
        }
    
        if (opponent === reqUserUsername) {
            return new Failure('Opponent must not be you', 400);
        }

        try {
            const check = await db.getUserByUsername(opponent);
            if (!check) {
                return new Failure('User does not exists', 400);
            }
            const timestamp: Date = new Date(Date.now());
            const game = await db.createGame(this.userId, check.id, dimension, 'invited', timestamp);
            return new Success(new Game(game.id, game.user1, game.user2, game.dimension, game.state));
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }

}
