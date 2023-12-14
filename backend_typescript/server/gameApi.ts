const express = require('express');
const gameRouter = express.Router();
import { Failure, Success } from "../models/Result";
const multer = require('multer');
const path = require('path');
import * as db from '../db';
import { NextFunction, Response } from 'express';
import User from "../models/User";
import Game from "../models/Game";
import { FinalResults } from "../models/GameManager";


interface ProfileUpdateBody {
    nickname: string;
    imgId: number | null;
}


interface GameBody {
    opponent: string;
    dimension: number;
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
    try {
        const user = req.user as User;
        const gameManager = await user.getGameManager();
        const game = await gameManager.getGameById(req.params.game_id);
        if (game instanceof Failure) {
            return res.status(game.status).json({msg: game.msg});
        }
        const userGame = game as Success<Game>;

        if (userGame.result.user1 !== user.id && userGame.result.user2 !== user.id) {
            return res.status(400).json({ msg: 'User not part of game' });
        }
        req.game = userGame.result;
        next();
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// Get user profile page
gameRouter.get("/profile", async (req, res: Response) => {
    try {
        const user = req.user as User;
        const userData = {
            username: user.username,
            nickname: user.nickname,
            user_score: {
                wins: user.wins,
                loses: user.loses
            },
            imageName: user.imgName,
            imgId: user.imgId
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
        //console.log(req.file);
        try {
            const result = await db.insertImage(req);
            res.status(200).json(result[0]);
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

    if (opponent === user.username) {
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
    const finalResults = results as Success<FinalResults>;
    return res.status(200).json(finalResults.result);
});


// Update game- accept state
gameRouter.put('/games/:game_id', async (req, res: Response) => {
    const user = req.user as User;
    const game = req.game as Game;
    const result = await game.acceptGame(user.id);
    if (result instanceof Failure) {
        return res.status(result.status).json({msg: result.msg});
    }
    return res.status(200).json({msg: 'game accepted by opponent'});
});


// delete a game
gameRouter.delete('/games/:game_id', async (req, res: Response) => {
    const user = req.user as User;
    const game = req.game as Game;
    const result = await game.deleteGame(user.id);
    if (result instanceof Failure) {
        return res.status(result.status).json({msg: result.msg});
    }
    return res.status(200).json({msg: 'game deleted by opponent'});
});


module.exports = gameRouter;