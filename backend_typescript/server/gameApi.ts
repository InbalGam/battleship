const express = require('express');
const gameRouter = express.Router();
import { Failure, Success } from "../models/Result";
const multer = require('multer');
const path = require('path');
import * as db from '../db';
import * as pf from '../phasesFuncs';
import { NextFunction, Response } from 'express';
import User from "../models/User";
import Game from "../models/Game";
import { UserGamesList } from "../models/GameManager";
import ShipManager from "../models/ShipManager";


interface ProfileUpdateBody {
    nickname: string;
    imgId: number | null;
}


interface GameBody {
    opponent: string;
    dimension: number;
}


interface ShipBody {
    ship_size: number;
    start_row: number;
    start_col: number;
    end_row: number;
    end_col: number;
}


interface ShotBody {
    row: number;
    col: number;
}


interface ChatMsg {
    message: string;
}


// Middlewares
gameRouter.use(['/', '/profile'], (req, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: 'You need to login first' });
        }
        next();
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});



gameRouter.use('/games/:game_id', async (req, res: Response, next: NextFunction) => {
    const user = req.user as User;
    const gameManager = await user.getGameManager();
    const game = await gameManager.getGameById(req.params.game_id);
    if (game instanceof Failure) {
        return res.status(game.status).json({msg: game.msg});
    }
    const userGame = game as Success<Game>;
    const player = userGame.result.getPlayerId();
    const opponent = userGame.result.getOpponentId();

    const userId = user.getUserId();
    if (player !== userId && opponent !== userId) {
        return res.status(400).json({ msg: 'User not part of game' });
    }

    req.game = userGame.result;
    req.userId = userId;
    next();
});


gameRouter.use('/games/:game_id/place', async (req, res: Response, next: NextFunction) => {
    const user = req.user as User;
    const game = req.game as Game;
    const gameShipManager = game.getGameShipManager(req.userId);
    if (!(gameShipManager instanceof ShipManager)) {
        return res.status(400).json({msg: gameShipManager});
    }
    const shipManager = gameShipManager as ShipManager;
    req.shipManager = shipManager;
    next();
});


// Get user profile page
gameRouter.get("/profile", async (req, res: Response) => {
    try {
        const user = req.user as User;
        const userData = {
            username: user.getUsername(),
            nickname: user.getNickname(),
            user_score: {
                wins: user.getWins(),
                loses: user.getLoses()
            },
            imageName: user.getImgName(),
            imgId: user.getImgId()
        }
        res.status(200).json(userData);
    } catch (e) {
        res.status(500).json({msg: 'Server error'});
    }
});


// Update user profile page
gameRouter.put('/profile', async (req, res: Response, next: NextFunction) => { 
    const { nickname, imgId }: ProfileUpdateBody = req.body;
    const user = req.user as User;
    if (!nickname) {
        return res.status(400).json({msg: 'Nickname must be specified'});
    }
    
    try {
        await user.updateProfile(imgId, nickname);
        res.status(200).json({ msg: 'Updated user' });
    } catch(e) {
        res.status(500).json({msg: 'Server error'});
    }
});


// Image Upload & Retrieve
const imageUpload = multer({
    storage: multer.diskStorage(
        {
            destination: function (req, file, cb) {
                cb(null, 'images/');
            },
            filename: function (req, file, cb) {
                cb(
                    null,
                    new Date().valueOf() + 
                    '_' +
                    file.originalname
                );
            }
        }
    ), 
});
// Image Upload Routes
gameRouter.post('/image',
    imageUpload.single('image'),
    async (req, res) => {
        try {
            const result = await db.insertImage(req.file.filename, req.file.path, req.file.mimetype, req.file.size);
            res.status(200).json(result);
        } catch (e) {
            console.log(e);
            res.status(500).json({ msg: 'Server error' });
        }
});
// Image Get Routes
gameRouter.get('/image/:filename', (req, res) => {
    const { filename } = req.params;
    const dirname = path.resolve();
    const fullfilepath = path.join(dirname, 'images/' + filename);
    return res.sendFile(fullfilepath);
});


// Create a new game
gameRouter.post('/games', async (req, res: Response) => {
    const {opponent, dimension}: GameBody = req.body;
    const user = req.user as User;

    if (dimension !== 10 && dimension !== 20) {
        return res.status(400).json({msg: 'Dimension must be 10 or 20'});
    }

    if (opponent === user.getUsername()) {
        return res.status(400).json({msg: 'Opponent must not be you'});
    }

    const gameManager = user.getGameManager();
    const result = await gameManager.createGame(opponent, dimension);

    if (result instanceof Failure) {
        return res.status(result.status).json({msg: result.msg});
    }
    return res.status(201).json({msg: 'Game created'});
});


// Get all user games
gameRouter.get('/games', async (req, res: Response) => {
    const user = req.user as User;
    const gameManager = user.getGameManager();
    const results = await gameManager.getUserGames();
    if (results instanceof Failure) {
        return res.status(results.status).json({msg: results.msg});
    }
    const finalResults = results as Success<UserGamesList>;
    return res.status(200).json(finalResults.result);
});


// Update game- accept state
gameRouter.put('/games/:game_id', async (req, res: Response) => {
    const game = req.game as Game;
    const result = await game.acceptGame(req.userId);
    if (result instanceof Failure) {
        return res.status(result.status).json({msg: result.msg});
    }
    return res.status(200).json({msg: 'game accepted by opponent'});
});


// delete a game
gameRouter.delete('/games/:game_id', async (req, res: Response) => {
    const game = req.game as Game;
    const result = await game.deleteGame(req.userId);
    if (result instanceof Failure) {
        return res.status(result.status).json({msg: result.msg});
    }
    return res.status(200).json({msg: 'game deleted by opponent'});
});


// Placing ships
gameRouter.post('/games/:game_id/place', async (req, res: Response) => {
    const { ship_size, start_row, start_col, end_row, end_col }: ShipBody = req.body;
    const shipManager = req.shipManager as ShipManager;
    const result = await shipManager.placeShip(req.userId, ship_size, start_row, end_row, start_col, end_col);
    if (result instanceof Failure) {
        return res.status(result.status).json({msg: result.msg});
    }
    const finalResult = result as Success<string>;
    return res.status(200).json({msg: finalResult.result});
});


// Unplace a ship
gameRouter.delete('/games/:game_id/place', async (req, res: Response) => {
    const { ship_size, start_row, start_col, end_row, end_col }: ShipBody = req.body;
    const shipManager = req.shipManager as ShipManager;
    const result = await shipManager.unplaceShip(req.userId, ship_size, start_row, end_row, start_col, end_col);
    if (result instanceof Failure) {
        return res.status(result.status).json({msg: result.msg});
    }
    const finalResult = result as Success<string>;
    return res.status(200).json({msg: finalResult.result});
});


// Game state change to ready / turn
gameRouter.post('/games/:game_id/ready', async (req, res: Response) => {
    const game = req.game as Game;
    const result = await game.userIsReady(req.userId);
    if (result instanceof Failure) {
        return res.status(result.status).json({msg: result.msg});
    }
    return res.status(200).json({msg: 'game state updated'});
});


// Player performs a shot
gameRouter.post('/games/:game_id/shoot', async (req, res: Response) => {
    const { row, col }: ShotBody = req.body;
    const game = req.game as Game;
    const shotResult = await game.userShoot(req.userId, row, col);
    if (shotResult instanceof Failure) {
        return res.status(shotResult.status).json({msg: shotResult.msg});
    }
    const shot = shotResult as Success<string>;
    return res.status(200).json({msg: shot.result});
});


// Chat api
gameRouter.post('/games/:game_id/chat', async (req, res: Response) => {
    const { message }: ChatMsg = req.body;
    if (!message) {
        return res.status(400).json({msg: 'Cannot send an empty message'});
    }

    const game = req.game as Game;
    const chatManager = game.getGameChatManager();
    const chatResult = await chatManager.postNewGameMsg(req.userId, message);
    if (chatResult instanceof Failure) {
        return res.status(chatResult.status).json({msg: chatResult.msg});
    }
    const result = chatResult as Success<string>;
    return res.status(200).json({msg: result.result});
});


gameRouter.get('/games/:game_id/chat', async (req, res: Response) => {
    const game = req.game as Game;
    const chatManager = game.getGameChatManager();
    const chatResult = await chatManager.getGameChat();
    if (chatResult instanceof Failure) {
        return res.status(chatResult.status).json({msg: chatResult.msg});
    }
    const result = chatResult as Success<db.Chat[]>;
    return res.status(200).json(result.result);
});


// Getting game info
gameRouter.get('/games/:game_id', async (req, res: Response) => {
    const game = req.game as Game;
    const result = await game.getGameInfo(req.userId);
    if (result instanceof Failure) {
        return res.status(result.status).json({msg: result.msg});
    }
    const gameInfo = result as Success<pf.GameInfo>
    return res.status(200).json(gameInfo.result);
});


module.exports = gameRouter;