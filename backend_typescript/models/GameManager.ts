import { Result, Success, Failure } from "./Result";
import * as db from '../db';
import Game from "./Game";


interface InvitedGames {
    game_id: number;
    opponent: string;
    board_dimension: number;
    createdByMe: boolean;
}


interface FinalResults {
    user_score: db.UserScore;
    invitations: InvitedGames[];
    active_games: db.ActiveGames[];
}


export default class GameManager {
    userId: number;
    constructor(userId: number) {
        this.userId = userId;
    }

    async getUserGames(): Promise<Result<FinalResults>> {
        let activeGames: db.ActiveGames[] = [];
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

            const FinalResults: FinalResults = {
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

    async getGameById(gameId: number): Promise<Result<Game>> {
        try {
            const game = await db.getGameById(gameId);
            if (!game) {
                return new Failure('Game does not exists', 400);
            }
            return new Success(new Game(game.id, game.user1, game.user2, game.dimension, game.state));
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }
 
    async createGame(opponentId: number, dimension: number): Promise<Result<Game>> {
        try {
            const timestamp: Date = new Date(Date.now());
            const game = await db.createGame(this.userId, opponentId, dimension, 'invited', timestamp);
            return new Success(new Game(game.id, game.user1, game.user2, game.dimension, game.state));
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }

}
