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
        await pool.query('INSERT INTO games (user1, user2, dimension, state, created_at) VALUES ($1, $2, $3, $4, $5) returning *', [req.user.id, check.rows[0].id, dimension, 'invited', timestamp]);
        return res.status(201).json({msg: 'Game created'});
    } catch(e) {
        res.status(500);
    }
});


// Get all user games
gameRouter.get('/games', async (req, res) => {
    let activeGames = [];
    let gameInvitations = [];

    try {
        const userStatus = await pool.query('select wins, loses from users where id = $1', [req.user.id]);

        const gamesShots = await pool.query(`select g.id as game_id, u.nickname as opponent, dimension as board_dimension, sum(case when user_id = $1 then 1 else 0 end) as hits, sum(case when user_id = $1 then 0 else 1 end) as bombed 
        from games g join shots s on g.id = s.game_id join users u on u.id = g.user2 where (user1 = $1 or user2 = $1) and s.hit = true and (g.state = $2 or g.state = $3) group by 1,2,3`, [req.user.id, 'user1_turn', 'user2_turn']);
        if (gamesShots.rows.length > 0) {
            activeGames.push(...gamesShots.rows);
        }

        const otherGames = await pool.query(`select g.id, g.user1, g.user2, u.nickname as opponent, g.dimension, state
        from games g join users u on u.id = g.user2 where (user1 = $1 or user2 = $1) and (state = $2 or state = $3 or state = $4 or state = $5) order by g.created_at`, [req.user.id, 'invited', 'accepted', 'user1_ready', 'user2_ready']);

        otherGames.rows.map(game => {
            if (game.state === 'invited') {
                gameInvitations.push({
                    game_id: game.id,
                    opponent: game.opponent,
                    board_dimension: game.dimension
                });
            }
        });

        otherGames.rows.map(game => {
            if (game.state !== 'invited') {
                activeGames.push(...{
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
                wins: userStatus.rows[0].wins,
                loses: userStatus.rows[0].loses
            },
            invitations: gameInvitations,
            active_games: activeGames
        }

        return res.status(200).json(finalResults);
    } catch (e) {
        res.status(500);
    }
});


// Update game- accept state
gameRouter.put('/games/:game_id', async (req, res) => {
    try {
        const game = await pool.query('select * from games where id = $1', [req.params.game_id]);
        const gameDetails = game.rows[0];

        if (req.user.id !== gameDetails.user2) {
            return res.status(401).json({msg: 'You are not the correct opponent player'});
        }

        if (gameDetails.state !== 'invited') {
            return res.status(401).json({msg: 'Cannot accept an active game'});
        }

        await pool.query('update games set state = $2 where id = $1;', [req.params.game_id, 'accepted']);
        return res.status(200).json({msg: 'game accepted by opponent'});

    } catch(e) {
        res.status(500);
    };
});


// delete a game
gameRouter.delete('/games/:game_id', async (req, res) => {
    try {
        const game = await pool.query('select * from games where id = $1', [req.params.game_id]);
        const gameDetails = game.rows[0];

        if (req.user.id !== gameDetails.user2) {
            return res.status(401).json({msg: 'You are not the correct opponent player'});
        }

        if (gameDetails.state !== 'invited') {
            return res.status(401).json({msg: 'Cannot delete an active game'});
        }

        await pool.query('delete from games where id = $1;', [req.params.game_id]);
        return res.status(200).json({msg: 'game deleted by opponent'});

    } catch(e) {
        res.status(500);
    };
});



module.exports = gameRouter;