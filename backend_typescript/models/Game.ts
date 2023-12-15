import { Failure, Success, Result } from "./Result";
import * as pf from '../phasesFuncs';
import * as db from '../db';
import { shipsAmount, shipAmountDimension, totalShipsSizes } from '../ships';
import ShipManager from "./ShipManager";
import ChatManager from "./ChatManager";


export default class Game {
    id: number;
    user1: number;
    user2: number;
    dimension: number;
    state: string;
    private chatManager: ChatManager;
    constructor(id: number, user1: number, user2: number, dimension: number, state: string) {
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
        this.dimension = dimension;
        this.state = state;
        this.chatManager = new ChatManager(id);
    }

    getGameId(): number {
        return this.id;
    }

    getPlayerId(): number {
        return this.user1;
    }

    getOpponentId(): number {
        return this.user2;
    }

    getDimension(): number {
        return this.dimension;
    }

    getState(): string {
        return this.state;
    }

    getGameShipManager(reqUserId: number): Result<ShipManager> {
        if (this.state === 'accepted' || this.state === 'user1_ready' || this.state === 'user2_ready') {
            return new ShipManager(this.id, reqUserId);
        } else {
            return 'Game is not in correct state to get ShipManager';
        }
    }

    getGameChatManager(): ChatManager {
        return this.chatManager;
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

    private verifyAcceptDecline(reqUserId: number): string {
        if (reqUserId !== this.user2) {
            return 'You are not the correct opponent player';
        }
        if (this.state !== 'invited') {
            return 'Cannot accept or delete an active game';
        }
        return 'Action can be made';
    }

    private async updateGameState(state: string): Promise<Game> {
        this.state = state;
        const game = await db.updateGameState(this.id, this.state);
        return new Game(game.id, game.user1, game.user2, game.dimension, game.state);
    }

    async deleteGame(reqUserId: number): Promise<Result<string>> {
        const result = this.verifyAcceptDecline(reqUserId);
        if (result === 'Action can be made') {
            try {
                await db.deleteGame(this.id);
                return new Success('Game deleted');
            } catch (e) {
                return new Failure('Server error', 500);
            }
        } else {
            return new Failure(result, 401);
        }
    }

    async acceptGame(reqUserId: number): Promise<Result<Game>> {
        const result = this.verifyAcceptDecline(reqUserId);
        if (result === 'Action can be made') {
            try {
                const game = await this.updateGameState('accepted');
                return new Success(game);
            } catch (e) {
                return new Failure('Server error', 500);
            }
        } else {
            return new Failure(result, 401);
        }
    }

    async userIsReady(reqUserId: number): Promise<Result<Game>> {
        let game: Game;
        try {
            if (this.state === 'accepted' || (this.user1 === reqUserId && this.state === 'user2_ready') || (this.user2 === reqUserId && this.state === 'user1_ready')) {
                const userShips = await db.getShipsData(this.id, reqUserId);
    
                if (shipAmountDimension[this.dimension] === userShips.length) {
                    if (this.state === 'accepted' && this.user1 === reqUserId) {
                        game = await this.updateGameState('user1_ready');    
                    } else if (this.state === 'accepted' && this.user2 === reqUserId) {
                        game = await this.updateGameState('user2_ready');  
                    } else if (this.state === 'user1_ready' || this.state === 'user2_ready') {
                        const gameState = ['user1_turn', 'user2_turn'];
                        const randomChoose = Math.floor(Math.random() * 2);
                        game = await this.updateGameState(gameState[randomChoose]); 
                    } else {
                        console.error('Unexpected game state or user');
                        throw new Error('Unexpected game state or user');
                    }
                    return new Success(game);
                } else {
                    return new Failure('Player did not finish placeing ships', 400);
                }
            } else {
                return new Failure('Game is not in correct state or user not correct user', 400);
            }
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }

    private async performAShot(row: number, col: number, player: number, opponent: number, userTurn: string, userWinner: string, gameDimension: number): Promise<Result<string>> {
        if (row > gameDimension || row < 1 || col > gameDimension || col < 1) {
            return new Failure('The shot is outside of the game board', 400);
        }
    
        const userGameShots = await db.getUserShots(this.id, player);
    
        const checkWasShot = userGameShots.some(shot => shot.row === row && shot.col === col);
        if (checkWasShot) {
            return new Failure('This cell was already shot', 400);
        };
    
        const hitResults = await db.getHitsResults(this.id, opponent, row, col);
    
        if (Number(hitResults.hits) === 1) {
            const timestamp = new Date(Date.now());
            await db.insertIntoShots(this.id, player, row, col, true, timestamp);
    
            const successfullShots = userGameShots.filter(shot => shot.hit === true);
            if (successfullShots.length + 1 === totalShipsSizes[gameDimension]) { // check winner
                await this.updateGameState(userWinner);
                await db.updateUsersScores(player, opponent);
                return 'Player performed a shot and won game';
            }
        } else {
            const timestamp = new Date(Date.now());
            await db.insertIntoShots(this.id, player, row, col, false, timestamp);
            await this.updateGameState(userTurn);
        }
    
        return 'Player performed a shot';
    };

    async userShoot(reqUserId: number, row: number, col: number): Promise<Result<string>> {
        let result;
        try {    
            if (this.user1 === reqUserId && this.state === 'user1_turn') {
                result = await this.performAShot(row, col, this.user1, this.user2, 'user2_turn', 'user1_won', this.dimension);
    
            } else if (this.user2 === reqUserId && this.state === 'user2_turn') {
                result = await this.performAShot(row, col, this.user2, this.user1, 'user1_turn', 'user2_won', this.dimension);
    
            } else {
                return new Failure('Game is not in correct state or user not correct user', 400);
            }
            if (result instanceof Failure) {
                return result;
            }
            return new Success(result);
    
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }
}
