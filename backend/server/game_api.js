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
        await pool.query('insert into games (user1, user2, dimension, state, created_at) values ($1, $2, $3, $4, $5) returning *', [req.user.id, check.rows[0].id, dimension, 'invited', timestamp]);
        return res.status(201).json({msg: 'Game created'});
    } catch(e) {
        res.status(500).json({msg: 'Server error'});
    }
});


// Get all user games
gameRouter.get('/games', async (req, res) => {
    console.log('here1');
    let activeGames = [];
    let gameInvitations = [];

    try {
        const userStatus = await pool.query('select wins, loses from users where id = $1', [req.user.id]);
        if (userStatus.rows.length === 0) {
            return res.status(400).json({msg: 'User does not exists'});
        }
        console.log('here2');

        const gamesShots = await pool.query(`select g.id as game_id, u.nickname as opponent, dimension as board_dimension, sum(case when user_id = $1 then 1 else 0 end) as hits, sum(case when user_id = $1 then 0 else 1 end) as bombed 
        from games g join shots s on g.id = s.game_id join users u on u.id = g.user2 where (user1 = $1 or user2 = $1) and s.hit = true and (g.state = $2 or g.state = $3) group by 1,2,3`, [req.user.id, 'user1_turn', 'user2_turn']);
        if (gamesShots.rows.length > 0) {
            activeGames.push(...gamesShots.rows);
        }

        console.log('here3');

        const otherGames = await pool.query(`select g.id, g.user1, g.user2, u.nickname as opponent, g.dimension, state
        from games g join users u on u.id = g.user2 where (user1 = $1 or user2 = $1) and (state = $2 or state = $3 or state = $4 or state = $5) order by g.created_at`, [req.user.id, 'invited', 'accepted', 'user1_ready', 'user2_ready']);

        console.log('here4');
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
                wins: userStatus.rows[0].wins,
                loses: userStatus.rows[0].loses
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
        const game = await pool.query('select * from games where id = $1', [req.params.game_id]);
        if (game.rows.length === 0) {
            return res.status(400).json({msg: 'Game does not exist'});
        }
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
        res.status(500).json({msg: 'Server error'});
    };
});


// delete a game
gameRouter.delete('/games/:game_id', async (req, res) => {
    try {
        const game = await pool.query('select * from games where id = $1', [req.params.game_id]);
        if (game.rows.length === 0) {
            return res.status(400).json({msg: 'Game does not exist'});
        }
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
        res.status(500).json({msg: 'Server error'});
    };
});


// Placing ships
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

gameRouter.post('/games/:game_id/place', async (req, res) => {
    const { ship_size, start_row, start_col, end_row, end_col } = req.body;

    try {
        const game = await pool.query('select * from games where id = $1', [req.params.game_id]);
        if (game.rows.length === 0) {
            return res.status(400).json({msg: 'Game does not exist'});
        }
        const gameDetails = game.rows[0];

        const gameShips = shipsAmount[gameDetails.dimension];
        let shipAmount = gameShips.ship_size;


        const check = await pool.query('select * from ships where game_id = $1 and user_id = $2', [req.params.game_id, req.user.id]);
        if (check.rows.length === 0) {
            await pool.query('insert into ships (game_id, user_id, size, start_row, start_col, end_row, end_col) values ($1, $2, $3, $4, $5, $6, $7)', [req.params.game_id, req.user.id, ship_size, start_row, start_col, end_row, end_col]);
            shipAmount = shipAmount - 1;
            shipsAmount[gameDetails.dimension].ship_size = shipAmount;
            return res.status(200).json({msg: `Placed a ship of size ${ship_size}, you have ${shipAmount} more of those to place`});
        } else {
            
        }

    } catch(e) {
        res.status(500).json({msg: 'Server error'});
    }

});


module.exports = gameRouter;