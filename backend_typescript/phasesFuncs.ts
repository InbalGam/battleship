import * as db from './db';


export interface Waiting {
    opponent: string;
    opponentImage: string | null;
    player: string;
    playerImage: string | null;
    phase: string;
    dimension: number;
}


export interface Winner {
    opponent: string;
    opponentImage: string | null;
    player: string;
    playerImage: string | null;
    phase: string;
    dimension: number;
    i_won: boolean;
}


export interface PlacingShips {
    opponent: string;
    opponentImage: string | null;
    player: string;
    playerImage: string | null;
    phase: string;
    remaining_ships: string[];
    placed_ships: {
        ship_size: number,
        start_row: number,
        start_col: number,
        end_row: number,
        end_col: number
    }[];
    dimension: number;
}


export interface GamePlay {
    opponent: string;
    opponentImage: string | null;
    player: string;
    playerImage: string | null;
    phase: string;
    my_turn: boolean;
    placed_ships: {
        ship_size: number,
        start_row: number,
        start_col: number,
        end_row: number,
        end_col: number
    }[];
    shots_sent: {row: number, col: number, hit: boolean}[];
    shots_recieved: {row: number, col: number, hit: boolean}[];
    dimension: number;
}


export function waitingForPlayer(gameDetails: db.Game, opponentsInformation: db.UserDb, playersInformation: db.UserDb): Waiting {
    const result = {
        opponent: opponentsInformation.nickname,
        opponentImage: opponentsInformation.imagename,
        player: playersInformation.nickname,
        playerImage: playersInformation.imagename,
        phase: 'waiting_for_other_player',
        dimension: gameDetails.dimension
    }
    return result;
};


export function winnerPhase(gameDetails: db.Game, gameUser: string, opponentsInformation: db.UserDb, playersInformation: db.UserDb): Winner {
    let result = {
        opponent: opponentsInformation.nickname,
        opponentImage: opponentsInformation.imagename,
        player: playersInformation.nickname,
        playerImage: playersInformation.imagename,
        phase: 'finished',
        dimension: gameDetails.dimension,
        i_won: true
    };
    if (gameDetails.state === 'user1_won' && gameUser === 'user1'){
        result['i_won'] = true;
    } else if (gameDetails.state === 'user1_won' && gameUser === 'user2') {
        result['i_won']= false;
    } else if (gameDetails.state === 'user2_won' && gameUser === 'user1') {
        result['i_won'] = false;
    } else if (gameDetails.state === 'user2_won' && gameUser === 'user2') {
        result['i_won'] =  true;
    };
    return result;
};


export async function placingPieces(gameDetails: db.Game, gameId: number, reqUserId: number, shipsAmount, opponentsInformation: db.UserDb, playersInformation: db.UserDb): Promise<PlacingShips> {
    const userShips = await db.getShipsData(gameId, reqUserId);

    const gameShips = shipsAmount;
    const allGameShips: string[] = []; // [5,4,3,3,2]
    for (const key in gameShips) {
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
};


export async function gamePlay(gameDetails: db.Game, gameId: number, reqUserId: number, gameUser: string, gameOpponent: number, opponentsInformation: db.UserDb, playersInformation: db.UserDb): Promise<GamePlay> {
    const userShips = await db.getShipsData(gameId, reqUserId);
    const placedShips = userShips.map(ship => {
        return {
            ship_size: ship.size,
            start_row: ship.start_row,
            start_col: ship.start_col,
            end_row: ship.end_row,
            end_col: ship.end_col
        }
    });

    let myTurn: boolean = true;
    if (gameUser === 'user1' && gameDetails.state === 'user1_turn') {
        myTurn = true;
    } else if (gameUser === 'user2' && gameDetails.state === 'user1_turn') {
        myTurn = false;
    } else if (gameUser === 'user2' && gameDetails.state === 'user2_turn') {
        myTurn = true;
    } else if (gameUser === 'user1' && gameDetails.state === 'user2_turn') {
        myTurn = false;
    }

    const gameShots = await db.getGameShots(gameId, gameOpponent);
    const shot_sent: {row: number, col: number, hit: boolean}[] = [];
    const shot_recieved: {row: number, col: number, hit: boolean}[] = [];

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
    }

    return result;
};

