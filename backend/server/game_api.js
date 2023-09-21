const express = require('express');
const gameRouter = express.Router();
const db = require('./db');


// Middlewares
gameRouter.use('/', (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: 'You need to login first' });
        }
        next();
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});


gameRouter.use('/games/:game_id', async (req, res, next) => {
    try {
        const game = db.getGameById(req.params.game_id);
        if (game.length === 0) {
            return res.status(400).json({ msg: 'Game does not exist' });
        }
        next();
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});

gameRouter.use('/games/:game_id', async (req, res, next) => {
    try {
        const game = db.getGameById(req.params.game_id);
        if (game[0].user1 !== req.user.id && game[0].user2 !== req.user.id) {
            return res.status(400).json({ msg: 'User not part of game' });
        }
        next();
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Vars
const shipsAmount = {
    // ship size : amount of ships
    10: {
        5: 1,
        4: 1,
        3: 2,
        2: 1
    },
    20: {
        8: 1,
        7: 1,
        6: 2,
        5: 2,
        4: 3,
        3: 4
    }
};

const totalShipsSizes = {
    10: 17,
    20: 61
}

// Create a new game
gameRouter.post('/games', async (req, res) => {
    const {opponent, dimension} = req.body;

    if (dimension !== 10 && dimension !== 20) {
        return res.status(400).json({msg: 'Dimension must be 10 or 20'});
    }

    if (opponent === req.user.username) {
        return res.status(400).json({msg: 'Opponent must not be you'});
    }

    try {
        const check = await pool.query('select * from users where username = $1', [opponent]);
        if (check.rows.length === 0) {
            return res.status(400).json({msg: 'User does not exists'});
        }

        const timestamp = new Date(Date.now());
        db.createGame(req.user.id, check.rows[0].id, dimension, 'invited', timestamp);
        return res.status(201).json({msg: 'Game created'});
    } catch(e) {
        res.status(500).json({msg: 'Server error'});
    }
});


// Get all user games
gameRouter.get('/games', async (req, res) => {
    let activeGames = [];
    let gameInvitations = [];

    try {
        const userScore = db.getUserScore(req.user.id);
        if (userScore.length === 0) {
            return res.status(400).json({msg: 'User does not exists'});
        }

        const gamesShots = db.getActiveGameData(req.user.id, 'user1_turn', 'user2_turn');
        if (gamesShots.length > 0) {
            activeGames.push(...gamesShots);
        }

        const otherGames = db.getOtherGamesData(req.user.id, 'invited', 'accepted', 'user1_ready', 'user2_ready');

        otherGames.forEach(game => {
            if (game.state === 'invited') {
                gameInvitations.push({
                    game_id: game.id,
                    opponent: game.opponent,
                    board_dimension: game.dimension,
                    createdByMe: game.user1 === req.user.id
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

        const finalResults = {
            user_score: {
                wins: userScore[0].wins,
                loses: userScore[0].loses
            },
            invitations: gameInvitations,
            active_games: activeGames
        }

        return res.status(200).json(finalResults);
    } catch (e) {
        res.status(500).json({msg: 'Server error'});
    }
});


// Update game- accept state
gameRouter.put('/games/:game_id', async (req, res) => {
    try {
        const game = db.getGameById(req.params.game_id);
        const gameDetails = game[0];

        if (req.user.id !== gameDetails.user2) {
            return res.status(401).json({msg: 'You are not the correct opponent player'});
        }

        if (gameDetails.state !== 'invited') {
            return res.status(401).json({msg: 'Cannot accept an active game'});
        }

        db.updateGameState(req.params.game_id, 'accepted');
        return res.status(200).json({msg: 'game accepted by opponent'});

    } catch(e) {
        res.status(500).json({msg: 'Server error'});
    };
});


// delete a game
gameRouter.delete('/games/:game_id', async (req, res) => {
    try {
        const game = db.getGameById(req.params.game_id);
        const gameDetails = game[0];

        if (req.user.id !== gameDetails.user2) {
            return res.status(401).json({msg: 'You are not the correct opponent player'});
        }

        if (gameDetails.state !== 'invited') {
            return res.status(401).json({msg: 'Cannot delete an active game'});
        }

        db.deleteGame(req.params.game_id);
        return res.status(200).json({msg: 'game deleted by opponent'});

    } catch(e) {
        res.status(500).json({msg: 'Server error'});
    };
});


// Placing ships
function checkShipPlacement(start_row, end_row, start_col, end_col, shipInDb) {
    if (shipInDb.start_row === shipInDb.end_row) {
        if ((start_row === shipInDb.start_row && start_col === (shipInDb.start_col - 1)) || (start_row === shipInDb.start_row && start_col === (shipInDb.end_col + 1))) {
            return 1;
        }

        if (start_row === (shipInDb.start_row + 1) && (start_col >= (shipInDb.start_col - 1) && start_col <= (shipInDb.end_col + 1))){
            return 1;
        }

        if (start_row === (shipInDb.start_row - 1) && (start_col >= (shipInDb.start_col - 1) && start_col <= (shipInDb.end_col + 1))){
            return 1;
        }

        if (start_row < shipInDb.start_row && end_row > shipInDb.start_row && (start_col >= (shipInDb.start_col - 1) && start_col <= (shipInDb.end_col + 1))) {
            return 1;
        }

        if (start_row < shipInDb.start_row && end_row > shipInDb.start_row && (end_col >= (shipInDb.start_col - 1) && end_col <= (shipInDb.end_col + 1))) {
            return 1;
        }
    } else if (shipInDb.start_row !== shipInDb.end_row) {
        if (start_col === (shipInDb.start_col - 1) && (start_row === shipInDb.start_row || start_row === shipInDb.end_row)) {
            return 1;
        }

        if (start_col === (shipInDb.start_col + 1) && (start_row === shipInDb.start_row || start_row === shipInDb.end_row)) {
            return 1;
        }

        if (start_row === (shipInDb.start_row - 1) && (start_col >= (shipInDb.start_col - 1) && start_col <= (shipInDb.start_col + 1))) {
            return 1;
        }

        if (start_row === (shipInDb.end_row + 1) && (start_col >= (shipInDb.start_col - 1) && start_col <= (shipInDb.start_col + 1))) {
            return 1;
        }

        if (start_col < shipInDb.start_col && end_col > shipInDb.start_col && (start_row >= (shipInDb.start_row - 1) && start_row <= (shipInDb.end_row + 1))) {
            return 1;
        }
    }
    return 0;
};


async function checkShips(req, dimension, ship_size) {
    const userShips = db.getShipsSizes(req.params.game_id, req.user.id);
    const gameShips = shipsAmount[dimension];
    const placedShips = userShips.map(ship => ship.size);

    let count = 0;
    for (let i = 0; i < placedShips.length; i++) {
        if (ship_size === placedShips[i]) {
            count += 1;
        }
    };

    if (count < gameShips[ship_size]) {
        return true; //'can place'
    } else {
        return false; //'cannot place'
    };
};


async function placeShip(game_id, user_id, ship_size, start_row, start_col, end_row, end_col, res) {
    db.placeAShip(game_id, user_id, ship_size, start_row, start_col, end_row, end_col);
    return res.status(200).json({msg: `Placed a ship of size ${ship_size}`});
};


gameRouter.post('/games/:game_id/place', async (req, res) => {
    const { ship_size, start_row, start_col, end_row, end_col } = req.body;

    if (start_row === end_row) {
        if ((Math.abs(end_col - start_col) + 1) !== ship_size) {
            return res.status(400).json({ msg: 'Ship is not in the correct size' });
        }
    } else if (start_col === end_col) {
        if ((Math.abs(end_row - start_row) + 1) !== ship_size) {
            return res.status(400).json({ msg: 'Ship is not in the correct size' });
        }
    } else {
        return res.status(400).json({ msg: 'Ship is not valid' });
    };

    try {
        const game = db.getGameById(req.params.game_id);
        const gameDetails = game[0];

        if (gameDetails.state === 'accepted' || (gameDetails.user1 === req.user.id && gameDetails.state === 'user2_ready') || (gameDetails.user2 === req.user.id && gameDetails.state === 'user1_ready')) {
            if (req.user.id !== gameDetails.user1 && req.user.id !== gameDetails.user2) {
                return res.status(400).json({ msg: 'User is not a player in the game' });
            }

            if (start_row > gameDetails.dimension || start_col > gameDetails.dimension || end_col > gameDetails.dimension || end_row > gameDetails.dimension) {
                return res.status(400).json({ msg: 'Ship is not inside board borders' });
            };

            if (start_row < 1 || start_col < 1 || end_col < 1 || end_row < 1) {
                return res.status(400).json({ msg: 'Ship is not inside board borders' });
            };

            const canPlace = await checkShips(req, gameDetails.dimension, ship_size);
            if (!canPlace) {
                return res.status(400).json({ msg: 'There are no more ships of this size to place' });
            }


            const ships = db.getShipsData(req.params.game_id, req.user.id);
            if (ships.length === 0) {
                await placeShip(req.params.game_id, req.user.id, ship_size, start_row, start_col, end_row, end_col, res);
            } else {
                const shipPlacementResult = ships.map(ship => checkShipPlacement(start_row, end_row, start_col, end_col, ship)).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
                if (shipPlacementResult > 0) {
                    return res.status(400).json({ msg: 'Ship cannot be next to another ship' });
                } else {
                    await placeShip(req.params.game_id, req.user.id, ship_size, start_row, start_col, end_row, end_col, res);
                }
            }
        } else {
            return res.status(400).json({ msg: 'Game is not in correct state or user not correct user' });
        }

    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }

});



// Unplace a ship
gameRouter.delete('/games/:game_id/place', async (req, res) => {
    const { ship_size, start_row, start_col, end_row, end_col } = req.body;

    try {
        const game = db.getGameById(req.params.game_id);
        const gameDetails = game[0];

        if (gameDetails.state === 'accepted' || (gameDetails.user1 === req.user.id && gameDetails.state === 'user2_ready') || (gameDetails.user2 === req.user.id && gameDetails.state === 'user1_ready')) {
            const userShips = db.getShipsData(req.params.game_id, req.user.id);
            const check = userShips.map(dbShip => {
                if (dbShip.size === ship_size && dbShip.start_row === start_row && dbShip.start_col === start_col && dbShip.end_row === end_row && dbShip.end_col === end_col) {
                    return true;
                }
            });
            if (check.includes(true)) {
                db.deleteAShip(req.params.game_id, req.user.id, ship_size, start_row, start_col, end_row, end_col);
                return res.status(200).json({msg: 'Ship deleted'});
            } else {
                return res.status(400).json({ msg: 'Ship was not placed cannot be unplaced' });
            }
        } else {
            return res.status(400).json({ msg: 'Game is not in correct state or user not correct user' });
        }

    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }

});


// Game state change to ready / turn
gameRouter.post('/games/:game_id/ready', async (req,res) => {
    try {
        const game = db.getGameById(req.params.game_id);
        const gameDetails = game[0];

        if (gameDetails.state === 'accepted' || (gameDetails.user1 === req.user.id && gameDetails.state === 'user2_ready') || (gameDetails.user2 === req.user.id && gameDetails.state === 'user1_ready')) {
            const userShips = db.getShipsData(req.params.game_id, req.user.id);

            const shipAmountDimension = {
                10: 5,
                20: 13
            }

            if (shipAmountDimension[gameDetails.dimension] === userShips.length) {
                if (gameDetails.state === 'accepted' && gameDetails.user1 === req.user.id) {
                    db.updateGameState(req.params.game_id, 'user1_ready');    
                } else if (gameDetails.state === 'accepted' && gameDetails.user2 === req.user.id) {
                    db.updateGameState(req.params.game_id, 'user2_ready');  
                } else if (gameDetails.state === 'user1_ready' || gameDetails.state === 'user2_ready') {
                    const gameState = ['user1_turn', 'user2_turn'];
                    const randomChoose = Math.floor(Math.random() * 2);
                    db.updateGameState(req.params.game_id, gameState[randomChoose]); 
                }
                return res.status(200).json({msg: 'game state updated'});
            } else {
                return res.status(400).json({ msg: 'Player did not finish placeing ships' });
            }
        } else {
            return res.status(400).json({ msg: 'Game is not in correct state or user not correct user' });
        }
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// Player performs a shot
async function performAShot(req, res, row, col, player, opponent, userTurn, userWinner, gameDimension) {
    if (row > gameDimension || row < 1 || col > gameDimension || col < 1) {
        return res.status(400).json({ msg: 'The shot is outside of the game board' });
    }

    const userGameShots = db.getUserShots(req.params.game_id, player);
    const checkWasShot = userGameShots.map(shot => {
        if (shot.row === row && shot.col === col) {
            return 1;
        } else {
            return 0;
        }
    }).reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    if (checkWasShot > 0) {
        return res.status(400).json({ msg: 'This cell was already shot' });
    };

    const hitResults = db.getHitsResults(req.params.game_id, opponent, row, col);

    if (Number(hitResults[0].hits) === 1) {
        const timestamp = new Date(Date.now());
        db.insertIntoShots(req.params.game_id, player, row, col, 'true', timestamp);

        const successfullShots = userGameShots.filter(shot => shot.hit === true);
        if (successfullShots.length + 1 === totalShipsSizes[gameDimension]) { // check winner
            db.updateGameState(req.params.game_id, userWinner);
            db.updateUsersScores(player, opponent)
            return res.status(200).json({msg: 'Player performed a shot and won game'});
        }
    } else {
        const timestamp = new Date(Date.now());
        db.insertIntoShots(req.params.game_id, player, row, col, 'false', timestamp);
        db.updateGameState(req.params.game_id, userTurn);
    }

    return res.status(200).json({msg: 'Player performed a shot'});
};

gameRouter.post('/games/:game_id/shoot', async (req,res) => {
    const { row, col } = req.body;
    try {
        const game = db.getGameById(req.params.game_id);
        const gameDetails = game[0];

        if (gameDetails.user1 === req.user.id && gameDetails.state === 'user1_turn') {
            performAShot(req, res, row, col, gameDetails.user1, gameDetails.user2, 'user2_turn', 'user1_won', gameDetails.dimension);

        } else if (gameDetails.user2 === req.user.id && gameDetails.state === 'user2_turn') {
            performAShot(req, res, row, col, gameDetails.user2, gameDetails.user1, 'user1_turn', 'user2_won', gameDetails.dimension);

        } else {
            return res.status(400).json({ msg: 'Game is not in correct state or user not correct user' });
        }

    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// Chat api
gameRouter.post('/games/:game_id/chat', async (req,res) => {
    const { message } = req.body;

    try {
        const timestamp = new Date(Date.now());
        db.postMsgToChat(req.params.game_id, req.user.id, message, timestamp);
        return res.status(200).json({msg: 'sent message'});
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});


gameRouter.get('/games/:game_id/chat', async (req,res) => {
    try {
        const gameChat = db.getChatMsgs(req.params.game_id);
        
        return res.status(200).json(gameChat);
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// Getting game info
gameRouter.get('/games/:game_id', async (req,res) => {
    let result = {};
    try {
        const game = db.getGameById(req.params.game_id);
        const gameDetails = game[0];

        if (gameDetails.state === 'invited') {
            return res.status(400).json({ msg: 'Game is in state invited' });
        };

        let gameUser;
        let gameOpponent;
        if (gameDetails.user1 === req.user.id) {
            gameUser = 'user1'; //string
            gameOpponent = gameDetails.user2; //id
        } else {
            gameUser = 'user2'; //string
            gameOpponent = gameDetails.user1; //id
        };

        const usersInformation = db.getUser(gameOpponent);

        // waiting_for_other_player phase
        if (gameDetails.user1 === req.user.id && gameDetails.state === 'user1_ready' || gameDetails.user2 === req.user.id && gameDetails.state === 'user2_ready') {
            result = {
                opponent: usersInformation[0].nickname,
                phase: 'waiting_for_other_player',
                dimension: gameDetails.dimension
            }
        };

        // winner phase
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


        // placing_pieces phase
        if (gameDetails.state === 'accepted' || (gameDetails.user1 === req.user.id && gameDetails.state === 'user2_ready') || (gameDetails.user2 === req.user.id && gameDetails.state === 'user1_ready')) {
            const userShips = db.getShipsData(req.params.game_id, req.user.id);

            const gameShips = shipsAmount[gameDetails.dimension];
            const allGameShips = []; // [5,4,3,3,2]
            for (key in gameShips) {
                for (let i = 0; i < gameShips[key]; i++) {
                    allGameShips.push(key);
                }
            };

            if (userShips.length === 0) {
                result = {
                    opponent: usersInformation[0].nickname,
                    phase: 'placing_pieces',
                    remaining_ships: allGameShips,
                    placed_ships: [],
                    dimension: gameDetails.dimension
                } 
            } else {
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

                result = {
                    opponent: usersInformation[0].nickname,
                    phase: 'placing_pieces',
                    remaining_ships: allGameShips,
                    placed_ships: placedShips,
                    dimension: gameDetails.dimension
                } 
            }
        };

        // gamePlay phase
        if (gameDetails.state === 'user1_turn' || gameDetails.state === 'user2_turn') {
            const userShips = db.getShipsData(req.params.game_id, req.user.id);
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

            const gameShots = db.getGameShots(req.params.game_id, gameOpponent);
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

            result = {
                opponent: usersInformation[0].nickname,
                phase: 'gamePlay',
                my_turn: myTurn,
                placed_ships: placedShips,
                shots_sent: shot_sent,
                shots_recieved: shot_recieved,
                dimension: gameDetails.dimension
            }

        };

        return res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});


module.exports = gameRouter;