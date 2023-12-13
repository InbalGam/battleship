"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Result_1 = require("./Result");
const db = require("../db");
const ships_1 = require("../ships");
class ShipManager {
    constructor(gameId, userId) {
        this.gameId = gameId;
        this.userId = userId;
    }
    async getUserShips() {
        try {
            const userShips = await db.getShipsData(this.gameId, this.userId);
            return new Result_1.Success(userShips);
        }
        catch (e) {
            return new Result_1.Failure('Server error', 500);
        }
    }
    async verifyRemainingShipsOfSize(dimension, ship_size) {
        const userShips = await db.getShipsSizes(this.gameId, this.userId);
        const gameShips = ships_1.shipsAmount[dimension];
        const placedShips = userShips.map(ship => ship.size);
        const amountFromShip = placedShips.filter(plShip => plShip === ship_size).length;
        if (amountFromShip < gameShips[ship_size]) {
            return true; //'can place'
        }
        else {
            return false; //'cannot place'
        }
        ;
    }
    checkShipIsValid(ship_size, start_row, end_row, start_col, end_col) {
        if (start_row === end_row) {
            if ((Math.abs(end_col - start_col) + 1) !== ship_size) {
                return false;
            }
        }
        else if (start_col === end_col) {
            if ((Math.abs(end_row - start_row) + 1) !== ship_size) {
                return false;
            }
        }
        else {
            return false;
        }
        ;
        return true;
    }
    async placeShip(reqUserId, ship_size, start_row, end_row, start_col, end_col) {
        if (!this.checkShipIsValid(ship_size, start_row, end_row, start_col, end_col)) {
            return new Result_1.Failure('Ship is not in the correct size', 400);
        }
        ;
        try {
            const game = await db.getGameById(this.gameId);
            if (game.state === 'accepted' || (game.user1 === reqUserId && game.state === 'user2_ready') || (game.user2 === reqUserId && game.state === 'user1_ready')) {
                if (reqUserId !== game.user1 && reqUserId !== game.user2) {
                    return new Result_1.Failure('User is not a player in the game', 400);
                }
                if (start_row > game.dimension || start_col > game.dimension || end_col > game.dimension || end_row > game.dimension) {
                    return new Result_1.Failure('Ship is not inside board borders', 400);
                }
                ;
                if (start_row < 1 || start_col < 1 || end_col < 1 || end_row < 1) {
                    return new Result_1.Failure('Ship is not inside board borders', 400);
                }
                ;
                const canPlace = await this.verifyRemainingShipsOfSize(game.dimension, ship_size);
                if (!canPlace) {
                    return new Result_1.Failure('There are no more ships of this size to place', 400);
                }
                const ships = await db.getShipsData(this.gameId, reqUserId);
                if (ships.length === 0) {
                    await db.placeAShip(this.gameId, reqUserId, ship_size, start_row, start_col, end_row, end_col);
                    return new Result_1.Success(`Placed a ship of size ${ship_size}`);
                }
                else {
                    const isShipClose = ships.some(ship => (0, ships_1.checkShipPlacement)(start_row, end_row, start_col, end_col, ship) === 1);
                    if (isShipClose) {
                        return new Result_1.Failure('Ship cannot be next to another ship', 400);
                    }
                    else {
                        await db.placeAShip(this.gameId, reqUserId, ship_size, start_row, start_col, end_row, end_col);
                        return new Result_1.Success(`Placed a ship of size ${ship_size}`);
                    }
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
    async unplaceShip(reqUserId, ship_size, start_row, end_row, start_col, end_col) {
        try {
            const game = await db.getGameById(this.gameId);
            if (game.state === 'accepted' || (game.user1 === reqUserId && game.state === 'user2_ready') || (game.user2 === reqUserId && game.state === 'user1_ready')) {
                const userShips = await db.getShipsData(this.gameId, reqUserId);
                const check = userShips.some(dbShip => dbShip.size === ship_size && dbShip.start_row === start_row && dbShip.start_col === start_col && dbShip.end_row === end_row && dbShip.end_col === end_col);
                if (check) {
                    await db.deleteAShip(this.gameId, reqUserId, ship_size, start_row, start_col, end_row, end_col);
                    return new Result_1.Success('Ship deleted');
                }
                else {
                    return new Result_1.Failure('Ship was not placed cannot be unplaced', 400);
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
}
exports.default = ShipManager;
