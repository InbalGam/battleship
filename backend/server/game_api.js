const express = require('express');
const gameRouter = express.Router();
const db = require('./db');
const {shipsAmount, totalShipsSizes, shipAmountDimension, checkShipPlacement} = require('./ships');
const {waitingForPlayer, winnerPhase, placingPieces, gamePlay} = require('./phasesFuncs');


// Middlewares
gameRouter.use(['/', '/profile'], (req, res, next) => {
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
        const game = await db.getGameById(req.params.game_id);
        if (game.length === 0) {
            return res.status(400).json({ msg: 'Game does not exist' });
        }

        if (game[0].user1 !== req.user.id && game[0].user2 !== req.user.id) {
            return res.status(400).json({ msg: 'User not part of game' });
        }
        next();
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get user profile page
gameRouter.get("/profile", async (req, res) => {
    try {
        const result = await db.getUser(req.user.id);
        const userData = {
            username: result[0].username,
            nickname: result[0].nickname,
            user_score: {
                wins: result[0].wins,
                loses: result[0].loses
            }
        }
        res.status(200).json(userData);
    } catch (e) {
        res.status(500).json({msg: 'Server error'});
    }
});

// Update user profile page
gameRouter.put('/profile', async (req, res, next) => { 
    const { nickname } = req.body;

    if (!nickname) {
        return res.status(400).json({msg: 'Nickname must be specified'});
    }
    
    try {
        const timestamp = new Date(Date.now());
        await db.updateUsername(req.user.id, nickname, timestamp);
        res.status(200).json({ msg: 'Updated user' });
    } catch(e) {
        res.status(500).json({msg: 'Server error'});
    }
});



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
        const check = await db.getUsername(opponent);
        if (check.length === 0) {
            return res.status(400).json({msg: 'User does not exists'});
        }

        const timestamp = new Date(Date.now());
        await db.createGame(req.user.id, check[0].id, dimension, 'invited', timestamp);
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
        const userScore = await db.getUserScore(req.user.id);
        if (userScore.length === 0) {
            return res.status(400).json({msg: 'User does not exists'});
        }

        const gamesShots = await db.getActiveGameData(req.user.id, 'user1_turn', 'user2_turn');
        if (gamesShots.length > 0) {
            activeGames.push(...gamesShots);
        }

        const otherGames = await db.getOtherGamesData(req.user.id, 'invited', 'accepted', 'user1_ready', 'user2_ready');

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

const verifyAcceptDecline = async (req, res, next) => {
    try {
        const game = await db.getGameById(req.params.game_id);
        const gameDetails = game[0];

        if (req.user.id !== gameDetails.user2) {
            return res.status(401).json({msg: 'You are not the correct opponent player'});
        }

        if (gameDetails.state !== 'invited') {
            return res.status(401).json({msg: 'Cannot accept or delete an active game'});
        }
        next();
    } catch(e) {
        res.status(500).json({msg: 'Server error'});
    };
};

// Update game- accept state
gameRouter.put('/games/:game_id', verifyAcceptDecline, async (req, res) => {
    try {
        await db.updateGameState(req.params.game_id, 'accepted');
        return res.status(200).json({msg: 'game accepted by opponent'});

    } catch(e) {
        res.status(500).json({msg: 'Server error'});
    };
});


// delete a game
gameRouter.delete('/games/:game_id', verifyAcceptDecline, async (req, res) => {
    try {
        await db.deleteGame(req.params.game_id);
        return res.status(200).json({msg: 'game deleted by opponent'});

    } catch(e) {
        res.status(500).json({msg: 'Server error'});
    };
});


// Placing ships
async function verifyRemainingShipsOfSize(req, dimension, ship_size) {
    const userShips = await db.getShipsSizes(req.params.game_id, req.user.id);
    const gameShips = shipsAmount[dimension];
    const placedShips = userShips.map(ship => ship.size);  

    const amountFromShip = placedShips.filter(plShip => plShip === ship_size).length;

    if ( amountFromShip < gameShips[ship_size]) {
        return true; //'can place'
    } else {
        return false; //'cannot place'
    };
};


async function placeShip(game_id, user_id, ship_size, start_row, start_col, end_row, end_col, res) {
    await db.placeAShip(game_id, user_id, ship_size, start_row, start_col, end_row, end_col);
    return res.status(200).json({msg: `Placed a ship of size ${ship_size}`});
};


function checkShipIsValid(ship_size, start_row, end_row, start_col, end_col) {
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
};


gameRouter.post('/games/:game_id/place', async (req, res) => {
    const { ship_size, start_row, start_col, end_row, end_col } = req.body;

    if (!checkShipIsValid(ship_size, start_row, end_row, start_col, end_col)) {
        return res.status(400).json({ msg: 'Ship is not in the correct size' });
    };

    try {
        const game = await db.getGameById(req.params.game_id);
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

            const canPlace = await verifyRemainingShipsOfSize(req, gameDetails.dimension, ship_size);
            if (!canPlace) {
                return res.status(400).json({ msg: 'There are no more ships of this size to place' });
            }


            const ships = await db.getShipsData(req.params.game_id, req.user.id);
            if (ships.length === 0) {
                await placeShip(req.params.game_id, req.user.id, ship_size, start_row, start_col, end_row, end_col, res);
            } else {
                const isShipClose = ships.some(ship => checkShipPlacement(start_row, end_row, start_col, end_col, ship) === 1);
                if (isShipClose) {
                    return res.status(400).json({ msg: 'Ship cannot be next to another ship' });
                } else {
                    await placeShip(req.params.game_id, req.user.id, ship_size, start_row, start_col, end_row, end_col, res);
                }
            }
        } else {
            return res.status(400).json({ msg: 'Game is not in correct state or user not correct user' });
        }

    } catch (e) {
        console.log(e);
        res.status(500).json({ msg: 'Server error' });
    }

});



// Unplace a ship
gameRouter.delete('/games/:game_id/place', async (req, res) => {
    const { ship_size, start_row, start_col, end_row, end_col } = req.body;

    try {
        const game = await db.getGameById(req.params.game_id);
        const gameDetails = game[0];

        if (gameDetails.state === 'accepted' || (gameDetails.user1 === req.user.id && gameDetails.state === 'user2_ready') || (gameDetails.user2 === req.user.id && gameDetails.state === 'user1_ready')) {
            const userShips = await db.getShipsData(req.params.game_id, req.user.id);
            const check = userShips.some(dbShip => dbShip.size === ship_size && dbShip.start_row === start_row && dbShip.start_col === start_col && dbShip.end_row === end_row && dbShip.end_col === end_col);
            if (check) {
                await db.deleteAShip(req.params.game_id, req.user.id, ship_size, start_row, start_col, end_row, end_col);
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
        const game = await db.getGameById(req.params.game_id);
        const gameDetails = game[0];

        if (gameDetails.state === 'accepted' || (gameDetails.user1 === req.user.id && gameDetails.state === 'user2_ready') || (gameDetails.user2 === req.user.id && gameDetails.state === 'user1_ready')) {
            const userShips = await db.getShipsData(req.params.game_id, req.user.id);

            if (shipAmountDimension[gameDetails.dimension] === userShips.length) {
                if (gameDetails.state === 'accepted' && gameDetails.user1 === req.user.id) {
                    await db.updateGameState(req.params.game_id, 'user1_ready');    
                } else if (gameDetails.state === 'accepted' && gameDetails.user2 === req.user.id) {
                    await db.updateGameState(req.params.game_id, 'user2_ready');  
                } else if (gameDetails.state === 'user1_ready' || gameDetails.state === 'user2_ready') {
                    const gameState = ['user1_turn', 'user2_turn'];
                    const randomChoose = Math.floor(Math.random() * 2);
                    await db.updateGameState(req.params.game_id, gameState[randomChoose]); 
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

    const userGameShots = await db.getUserShots(req.params.game_id, player);

    const checkWasShot = userGameShots.some(shot => shot.row === row && shot.col === col);
    if (checkWasShot) {
        return res.status(400).json({ msg: 'This cell was already shot' });
    };

    const hitResults = await db.getHitsResults(req.params.game_id, opponent, row, col);

    if (Number(hitResults[0].hits) === 1) {
        const timestamp = new Date(Date.now());
        await db.insertIntoShots(req.params.game_id, player, row, col, 'true', timestamp);

        const successfullShots = userGameShots.filter(shot => shot.hit === true);
        if (successfullShots.length + 1 === totalShipsSizes[gameDimension]) { // check winner
            await db.updateGameState(req.params.game_id, userWinner);
            await db.updateUsersScores(player, opponent)
            return res.status(200).json({msg: 'Player performed a shot and won game'});
        }
    } else {
        const timestamp = new Date(Date.now());
        await db.insertIntoShots(req.params.game_id, player, row, col, 'false', timestamp);
        await db.updateGameState(req.params.game_id, userTurn);
    }

    return res.status(200).json({msg: 'Player performed a shot'});
};

gameRouter.post('/games/:game_id/shoot', async (req,res) => {
    const { row, col } = req.body;
    try {
        const game = await db.getGameById(req.params.game_id);
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
        await db.postMsgToChat(req.params.game_id, req.user.id, message, timestamp);
        return res.status(200).json({msg: 'sent message'});
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});


gameRouter.get('/games/:game_id/chat', async (req,res) => {
    try {
        const gameChat = await db.getChatMsgs(req.params.game_id);
        
        return res.status(200).json(gameChat);
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// Getting game info
gameRouter.get('/games/:game_id', async (req,res) => {
    let result;
    try {
        const game = await db.getGameById(req.params.game_id);
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

        const usersInformation = await db.getUser(gameOpponent);

        if (gameDetails.user1 === req.user.id && gameDetails.state === 'user1_ready' || gameDetails.user2 === req.user.id && gameDetails.state === 'user2_ready') {
        // waiting_for_other_player phase
            result = waitingForPlayer(gameDetails, usersInformation);
        } else if (gameDetails.state === 'user1_won' || gameDetails.state === 'user2_won') {
        // winner phase
            result = winnerPhase(gameDetails, gameUser, usersInformation);
        } else if (gameDetails.state === 'accepted' || (gameDetails.user1 === req.user.id && gameDetails.state === 'user2_ready') || (gameDetails.user2 === req.user.id && gameDetails.state === 'user1_ready')) {
        // placing_pieces phase
            result = await placingPieces(gameDetails, req, shipsAmount[gameDetails.dimension], usersInformation);
        } else if (gameDetails.state === 'user1_turn' || gameDetails.state === 'user2_turn') {
        // gamePlay phase
            result = await gamePlay(gameDetails, req, gameUser, gameOpponent, usersInformation);
        };

        return res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});


module.exports = gameRouter;