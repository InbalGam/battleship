import { Failure, Success, Result } from "./Result";
import * as db from '../db';
import { shipsAmount, checkShipPlacement } from '../ships';


export default class ShipManager {
    private gameId: number;
    private userId: number;
    constructor(gameId: number, userId: number) {
        this.gameId = gameId;
        this.userId = userId;
    }

    async getUserShips(): Promise<Result<db.Ship[]>> {
        try {
            const userShips = await db.getShipsData(this.gameId, this.userId);
            return new Success(userShips);
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }

    private async verifyRemainingShipsOfSize(dimension: number, ship_size: number): Promise<boolean> {
        const userShips = await db.getShipsSizes(this.gameId, this.userId);
        const gameShips = shipsAmount[dimension];
        const placedShips = userShips.map(ship => ship.size);  
    
        const amountFromShip = placedShips.filter(plShip => plShip === ship_size).length;
    
        if ( amountFromShip < gameShips[ship_size]) {
            return true; //'can place'
        } else {
            return false; //'cannot place'
        };
    }
    
    
    private checkShipIsValid(ship_size: number, start_row: number, end_row: number, start_col: number, end_col: number): boolean {
        if (start_row === end_row) {
            if ((Math.abs(end_col - start_col) + 1) !== ship_size) {
                return false;
            }
        } else if (start_col === end_col) {
            if ((Math.abs(end_row - start_row) + 1) !== ship_size) {
                return false;
            }
        } else {
            return false;
        };
    
        return true;
    }

    async placeShip(reqUserId: number, ship_size: number, start_row: number, end_row: number, start_col: number, end_col: number): Promise<Result<string>> {
        if (!this.checkShipIsValid(ship_size, start_row, end_row, start_col, end_col)) {
            return new Failure('Ship is not in the correct size', 400);
        };
    
        try {
            const game = await db.getGameById(this.gameId);
    
            if (game.state === 'accepted' || (game.user1 === reqUserId && game.state === 'user2_ready') || (game.user2 === reqUserId && game.state === 'user1_ready')) {
                if (reqUserId !== game.user1 && reqUserId !== game.user2) {
                    return new Failure('User is not a player in the game', 400);
                }
    
                if (start_row > game.dimension || start_col > game.dimension || end_col > game.dimension || end_row > game.dimension) {
                    return new Failure('Ship is not inside board borders', 400);
                };
    
                if (start_row < 1 || start_col < 1 || end_col < 1 || end_row < 1) {
                    return new Failure('Ship is not inside board borders', 400);
                };
    
                const canPlace = await this.verifyRemainingShipsOfSize(game.dimension, ship_size);
                if (!canPlace) {
                    return new Failure('There are no more ships of this size to place', 400);
                }
    
    
                const ships = await db.getShipsData(this.gameId, reqUserId);
                if (ships.length === 0) {
                    await db.placeAShip(this.gameId, reqUserId, ship_size, start_row, start_col, end_row, end_col);
                    return new Success(`Placed a ship of size ${ship_size}`);
                } else {
                    const isShipClose = ships.some(ship => checkShipPlacement(start_row, end_row, start_col, end_col, ship) === 1);
                    if (isShipClose) {
                        return new Failure('Ship cannot be next to another ship', 400);
                    } else {
                        await db.placeAShip(this.gameId, reqUserId, ship_size, start_row, start_col, end_row, end_col);
                        return new Success(`Placed a ship of size ${ship_size}`);
                    }
                }
            } else {
                return new Failure('Game is not in correct state or user not correct user', 400);
            }
    
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }

    async unplaceShip(reqUserId: number, ship_size: number, start_row: number, end_row: number, start_col: number, end_col: number): Promise<Result<string>> {
        try {
            const game = await db.getGameById(this.gameId);
    
            if (game.state === 'accepted' || (game.user1 === reqUserId && game.state === 'user2_ready') || (game.user2 === reqUserId && game.state === 'user1_ready')) {
                const userShips = await db.getShipsData(this.gameId, reqUserId);
                const check = userShips.some(dbShip => dbShip.size === ship_size && dbShip.start_row === start_row && dbShip.start_col === start_col && dbShip.end_row === end_row && dbShip.end_col === end_col);
                if (check) {
                    await db.deleteAShip(this.gameId, reqUserId, ship_size, start_row, start_col, end_row, end_col);
                    return new Success('Ship deleted');
                } else {
                    return new Failure('Ship was not placed cannot be unplaced', 400);
                }
            } else {
                return new Failure('Game is not in correct state or user not correct user', 400);
            }
    
        } catch (e) {
            return new Failure('Server error', 500);
        }
    }
}