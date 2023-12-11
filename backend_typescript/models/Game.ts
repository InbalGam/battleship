import { Failure, Success, Result } from "./Result";
import * as pf from '../phasesFuncs';
import * as db from '../db';
import { shipsAmount } from '../ships';
import User from "./User";

export default class Game {
    id: number;
    user1: number;
    user2: number;
    dimension: number;
    state: string;
    constructor(id: number, user1: number, user2: number, dimension: number, state: string) {
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

    async getGameInfo(reqUserId: number): Promise<Result<pf.Waiting | pf.Winner | pf.PlacingShips | pf.GamePlay>> {
        let result;
        try {
            const gameDetails = await db.getGameById(this.id);

            if (gameDetails.state === 'invited') {
                return new Failure('Game is in state invited', 400);
            };

            let gameUser: string;
            let gamePlayer: number;
            let gameOpponent: number;
            if (gameDetails.user1 === reqUserId) {
                gameUser = 'user1'; //string
                gamePlayer = gameDetails.user1;
                gameOpponent = gameDetails.user2; //id
            } else {
                gameUser = 'user2'; //string
                gamePlayer = gameDetails.user2;
                gameOpponent = gameDetails.user1; //id
            };

            const opponentsInformation = await db.getUserById(gameOpponent);
            const playersInformation = await db.getUserById(gamePlayer);

            if (gameDetails.user1 === reqUserId && gameDetails.state === 'user1_ready' || gameDetails.user2 === reqUserId && gameDetails.state === 'user2_ready') {
                // waiting_for_other_player phase
                result = pf.waitingForPlayer(gameDetails, opponentsInformation, playersInformation);
            } else if (gameDetails.state === 'user1_won' || gameDetails.state === 'user2_won') {
                // winner phase
                result = pf.winnerPhase(gameDetails, gameUser, opponentsInformation, playersInformation);
            } else if (gameDetails.state === 'accepted' || (gameDetails.user1 === reqUserId && gameDetails.state === 'user2_ready') || (gameDetails.user2 === reqUserId && gameDetails.state === 'user1_ready')) {
                // placing_pieces phase
                result = await pf.placingPieces(gameDetails, this.id, reqUserId, shipsAmount[gameDetails.dimension], opponentsInformation, playersInformation);
            } else if (gameDetails.state === 'user1_turn' || gameDetails.state === 'user2_turn') {
                // gamePlay phase
                result = await pf.gamePlay(gameDetails, this.id, reqUserId, gameUser, gameOpponent, opponentsInformation, playersInformation);
            };

            return new Success(result);
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }

    private async updateGameState(state: string) {
        try {
            this.state = state;
            const game = await db.updateGameState(this.id, this.state);
            return new Success(new Game(game.id, game.user1, game.user2, game.dimension, game.state));
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }

    async deleteGame(): Promise<Result<string>> {
        try {
            await db.deleteGame(this.id);
            return new Success('Game deleted');
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }

    async acceptGame() {
        try {
            await this.updateGameState('accepted');
            return new Success('Game accepted by opponent');
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }
}
