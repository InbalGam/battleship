"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamePlay = exports.placingPieces = exports.winnerPhase = exports.waitingForPlayer = void 0;
const db = require("./db");
function waitingForPlayer(gameDetails, opponentsInformation, playersInformation) {
    const result = {
        opponent: opponentsInformation.nickname,
        opponentImage: opponentsInformation.imagename,
        player: playersInformation.nickname,
        playerImage: playersInformation.imagename,
        phase: 'waiting_for_other_player',
        dimension: gameDetails.dimension
    };
    return result;
}
exports.waitingForPlayer = waitingForPlayer;
;
function winnerPhase(gameDetails, gameUser, opponentsInformation, playersInformation) {
    let result = {
        opponent: opponentsInformation.nickname,
        opponentImage: opponentsInformation.imagename,
        player: playersInformation.nickname,
        playerImage: playersInformation.imagename,
        phase: 'finished',
        dimension: gameDetails.dimension
    };
    if (gameDetails.state === 'user1_won' && gameUser === 'user1') {
        result['i_won'] = true;
    }
    else if (gameDetails.state === 'user1_won' && gameUser === 'user2') {
        result['i_won'] = false;
    }
    else if (gameDetails.state === 'user2_won' && gameUser === 'user1') {
        result['i_won'] = false;
    }
    else if (gameDetails.state === 'user2_won' && gameUser === 'user2') {
        result['i_won'] = true;
    }
    ;
    return result;
}
exports.winnerPhase = winnerPhase;
;
async function placingPieces(gameDetails, gameId, reqUserId, shipsAmount, opponentsInformation, playersInformation) {
    const userShips = await db.getShipsData(gameId, reqUserId);
    const gameShips = shipsAmount;
    const allGameShips = []; // [5,4,3,3,2]
    for (const key in gameShips) {
        for (let i = 0; i < gameShips[key]; i++) {
            allGameShips.push(key);
        }
    }
    ;
    const placedShips = userShips.map(ship => {
        const shipIndex = allGameShips.indexOf(ship.size.toString());
        allGameShips.splice(shipIndex, 1);
        return {
            ship_size: ship.size,
            start_row: ship.start_row,
            start_col: ship.start_col,
            end_row: ship.end_row,
            end_col: ship.end_col
        };
    });
    const result = {
        opponent: opponentsInformation.nickname,
        opponentImage: opponentsInformation.imagename,
        player: playersInformation.nickname,
        playerImage: playersInformation.imagename,
        phase: 'placing_pieces',
        remaining_ships: allGameShips,
        placed_ships: placedShips,
        dimension: gameDetails.dimension
    };
    return result;
}
exports.placingPieces = placingPieces;
;
async function gamePlay(gameDetails, gameId, reqUserId, gameUser, gameOpponent, opponentsInformation, playersInformation) {
    const userShips = await db.getShipsData(gameId, reqUserId);
    const placedShips = userShips.map(ship => {
        return {
            ship_size: ship.size,
            start_row: ship.start_row,
            start_col: ship.start_col,
            end_row: ship.end_row,
            end_col: ship.end_col
        };
    });
    let myTurn = true;
    if (gameUser === 'user1' && gameDetails.state === 'user1_turn') {
        myTurn = true;
    }
    else if (gameUser === 'user2' && gameDetails.state === 'user1_turn') {
        myTurn = false;
    }
    else if (gameUser === 'user2' && gameDetails.state === 'user2_turn') {
        myTurn = true;
    }
    else if (gameUser === 'user1' && gameDetails.state === 'user2_turn') {
        myTurn = false;
    }
    const gameShots = await db.getGameShots(gameId, gameOpponent);
    const shot_sent = [];
    const shot_recieved = [];
    gameShots.forEach(shot => {
        if (shot.opponent_shot === 1) {
            shot_recieved.push({
                row: shot.row,
                col: shot.col,
                hit: shot.hit
            });
        }
        else {
            shot_sent.push({
                row: shot.row,
                col: shot.col,
                hit: shot.hit
            });
        }
    });
    const result = {
        opponent: opponentsInformation.nickname,
        opponentImage: opponentsInformation.imagename,
        player: playersInformation.nickname,
        playerImage: playersInformation.imagename,
        phase: 'gamePlay',
        my_turn: myTurn,
        placed_ships: placedShips,
        shots_sent: shot_sent,
        shots_recieved: shot_recieved,
        dimension: gameDetails.dimension
    };
    return result;
}
exports.gamePlay = gamePlay;
;
