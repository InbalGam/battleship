const express = require('express');
const gameRouter = express.Router();
const {pool} = require('./db');


// Middlewares
gameRouter.use('/', (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({msg: 'You need to login first'});
    }
    next();
});


// Create a new game
gameRouter.post('/games', async (req, res, next) => {
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
        await pool.query('INSERT INTO games (user1, user2, dimension, state, created_at) VALUES ($1, $2, $3, $4, $5) returning *', [req.user.id, check.rows[0].id, dimension, 'invited', timestamp]);
        return res.status(201).json({msg: 'Game created'});
    } catch(e) {
        res.status(500);
    }
});


// Get all user games
gameRouter.get('/games', async (req, res, next) => {
    try {
        const gamesIds = await pool.query('select id from games where user1 = $1 or user2 = $1 and (g.state = "user1_turn" or g.state = "user2_turn") order by g.created_at', [req.user.id]);
        const gamesShots = await pool.query('select game_id, user_id, count(hit) from shots where game_id = ANY ($1) and hit = true group by game_id, user_id', [gamesIds.rows]);
        
        // const gameStatus = gamesIds.map(gameId => {
        //     let opponentSum = 0;
        //     let playerSum = 0;
        //     gamesShots.forEach(gameLine => {
        //         if (gameLine.game_id === gameId) {
        //             if (gameLine.user_id === req.user.id) {
        //                 if (gameLine.hit) {
        //                     playerSum += 1;
        //                 }
        //             } else {
        //                 if (gameLine.hit) {
        //                     opponentSum += 1;
        //                 }
        //             }
        //         }
        //     });
        //     return {
        //         game_id: gameId,
        //         hits: playerSum,
        //         bombed: opponentSum
        //     }
        // });


        const results = await pool.query('select * from games where user1 = $1 or user2 = $1 and (state = "invited" or state = "accepted" or state = "user1_ready" or state = "user2_ready") order by created_at', [req.user.id]);
        const gameInvitations = results.rows.map(game => {
            if (game.state === 'invited') {
                return {
                    game_id: game.id,
                    opponent: game.user2,
                    board_dimension: game.dimension
                };
            }
        });

        const activeGames = results.rows.map(game => {
            if (game.state === 'accepted' || game.state === 'user1_ready' || game.state === 'user2_ready') {
                return {
                    game_id: game.id,
                    opponent: game.user2,
                    board_dimension: game.dimension,
                    hits: 0,
                    bombed: 0
                };
            }
        });

    } catch (e) {
        res.status(500);
    }
});

module.exports = gameRouter;