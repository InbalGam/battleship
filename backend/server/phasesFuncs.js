const db = require('./db');


function waitingForPlayer(gameDetails, usersInformation) {
    const result = {
        opponent: usersInformation[0].nickname,
        phase: 'waiting_for_other_player',
        dimension: gameDetails.dimension
    }
    return result;
};


function winnerPhase(gameDetails, gameUser, usersInformation) {
    let result;
    if (gameDetails.state === 'user1_won' && gameUser === 'user1'){
        result = {
            opponent: usersInformation[0].nickname,
            phase: 'finished',
            i_won: true,
            dimension: gameDetails.dimension
        }
    } else if (gameDetails.state === 'user1_won' && gameUser === 'user2') {
        result = {
            opponent: usersInformation[0].nickname,
            phase: 'finished',
            i_won: false,
            dimension: gameDetails.dimension
        }
    } else if (gameDetails.state === 'user2_won' && gameUser === 'user1') {
        result = {
            opponent: usersInformation[0].nickname,
            phase: 'finished',
            i_won: false,
            dimension: gameDetails.dimension
        }
    } else if (gameDetails.state === 'user2_won' && gameUser === 'user2') {
        result = {
            opponent: usersInformation[0].nickname,
            phase: 'finished',
            i_won: true,
            dimension: gameDetails.dimension
        }
    };
    return result;
};


async function placingPieces(gameDetails, req, shipsAmount, usersInformation) {
    const userShips = await db.getShipsData(req.params.game_id, req.user.id);

    const gameShips = shipsAmount;
    const allGameShips = []; // [5,4,3,3,2]
    for (key in gameShips) {
        for (let i = 0; i < gameShips[key]; i++) {
            allGameShips.push(key);
        }
    };

    const placedShips = userShips.map(ship => {
        const shipIndex = allGameShips.indexOf(ship.size.toString());
        allGameShips.splice(shipIndex, 1);
        return {
            ship_size: ship.size,
            start_row: ship.start_row,
            start_col: ship.start_col,
            end_row: ship.end_row,
            end_col: ship.end_col
        }
    });

    const result = {
        opponent: usersInformation[0].nickname,
        phase: 'placing_pieces',
        remaining_ships: allGameShips,
        placed_ships: placedShips,
        dimension: gameDetails.dimension
    };
    return result;
};


async function gamePlay(gameDetails, req, gameUser, gameOpponent, usersInformation) {
    const userShips = await db.getShipsData(req.params.game_id, req.user.id);
    const placedShips = userShips.map(ship => {
        return {
            ship_size: ship.size,
            start_row: ship.start_row,
            start_col: ship.start_col,
            end_row: ship.end_row,
            end_col: ship.end_col
        }
    });

    let myTurn;
    if (gameUser === 'user1' && gameDetails.state === 'user1_turn') {
        myTurn = true;
    } else if (gameUser === 'user2' && gameDetails.state === 'user1_turn') {
        myTurn = false;
    } else if (gameUser === 'user2' && gameDetails.state === 'user2_turn') {
        myTurn = true;
    } else if (gameUser === 'user1' && gameDetails.state === 'user2_turn') {
        myTurn = false;
    }

    const gameShots = await db.getGameShots(req.params.game_id, gameOpponent);
    const shot_sent = [];
    const shot_recieved = [];

    gameShots.forEach(shot => {
        if (shot.opponent_shot === 1) {
            shot_recieved.push({
                row: shot.row,
                col: shot.col,
                hit: shot.hit
            });
        } else {
            shot_sent.push({
                row: shot.row,
                col: shot.col,
                hit: shot.hit
            });
        }
    });

    const result = {
        opponent: usersInformation[0].nickname,
        phase: 'gamePlay',
        my_turn: myTurn,
        placed_ships: placedShips,
        shots_sent: shot_sent,
        shots_recieved: shot_recieved,
        dimension: gameDetails.dimension
    }

    return result;
};

module.exports = {
    waitingForPlayer, winnerPhase, placingPieces, gamePlay
};