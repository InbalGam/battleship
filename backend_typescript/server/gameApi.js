"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const gameRouter = express.Router();
const Result_1 = require("../models/Result");
const multer = require('multer');
const path = require('path');
const db = require("../db");
const ShipManager_1 = require("../models/ShipManager");
// Middlewares
gameRouter.use(['/', '/profile'], (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: 'You need to login first' });
        }
        next();
    }
    catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});
gameRouter.use('/games/:game_id', async (req, res, next) => {
    const user = req.user;
    const gameManager = await user.getGameManager();
    const game = await gameManager.getGameById(req.params.game_id);
    if (game instanceof Result_1.Failure) {
        return res.status(game.status).json({ msg: game.msg });
    }
    const userGame = game;
    if (userGame.result.user1 !== user.id && userGame.result.user2 !== user.id) {
        return res.status(400).json({ msg: 'User not part of game' });
    }
    req.game = userGame.result;
    next();
});
gameRouter.use('/games/:game_id/place', async (req, res, next) => {
    const user = req.user;
    const game = req.game;
    const gameShipManager = game.getGameShipManager(user.id);
    if (!(gameShipManager instanceof ShipManager_1.default)) {
        return res.status(400).json({ msg: gameShipManager });
    }
    const shipManager = gameShipManager;
    req.shipManager = shipManager;
    next();
});
// Get user profile page
gameRouter.get("/profile", async (req, res) => {
    try {
        const user = req.user;
        const userData = {
            username: user.username,
            nickname: user.nickname,
            user_score: {
                wins: user.wins,
                loses: user.loses
            },
            imageName: user.imgName,
            imgId: user.imgId
        };
        res.status(200).json(userData);
    }
    catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});
// Update user profile page
gameRouter.put('/profile', async (req, res, next) => {
    const { nickname, imgId } = req.body;
    const user = req.user;
    if (!nickname) {
        return res.status(400).json({ msg: 'Nickname must be specified' });
    }
    try {
        await user.updateProfile(imgId, nickname);
        res.status(200).json({ msg: 'Updated user' });
    }
    catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});
// Image Upload & Retrieve
const imageUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/');
        },
        filename: function (req, file, cb) {
            cb(null, new Date().valueOf() +
                '_' +
                file.originalname);
        }
    }),
});
// Image Upload Routes
gameRouter.post('/image', imageUpload.single('image'), async (req, res) => {
    try {
        const result = await db.insertImage(req);
        res.status(200).json(result[0]);
    }
    catch (e) {
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
gameRouter.post('/games', async (req, res) => {
    const { opponent, dimension } = req.body;
    const user = req.user;
    if (dimension !== 10 && dimension !== 20) {
        return res.status(400).json({ msg: 'Dimension must be 10 or 20' });
    }
    if (opponent === user.username) {
        return res.status(400).json({ msg: 'Opponent must not be you' });
    }
    const gameManager = user.getGameManager();
    const result = await gameManager.createGame(opponent, dimension);
    if (result instanceof Result_1.Failure) {
        return res.status(result.status).json({ msg: result.msg });
    }
    return res.status(201).json({ msg: 'Game created' });
});
// Get all user games
gameRouter.get('/games', async (req, res) => {
    const user = req.user;
    const gameManager = user.getGameManager();
    const results = await gameManager.getUserGames();
    if (results instanceof Result_1.Failure) {
        return res.status(results.status).json({ msg: results.msg });
    }
    const finalResults = results;
    return res.status(200).json(finalResults.result);
});
// Update game- accept state
gameRouter.put('/games/:game_id', async (req, res) => {
    const user = req.user;
    const game = req.game;
    const result = await game.acceptGame(user.id);
    if (result instanceof Result_1.Failure) {
        return res.status(result.status).json({ msg: result.msg });
    }
    return res.status(200).json({ msg: 'game accepted by opponent' });
});
// delete a game
gameRouter.delete('/games/:game_id', async (req, res) => {
    const user = req.user;
    const game = req.game;
    const result = await game.deleteGame(user.id);
    if (result instanceof Result_1.Failure) {
        return res.status(result.status).json({ msg: result.msg });
    }
    return res.status(200).json({ msg: 'game deleted by opponent' });
});
// Placing ships
gameRouter.post('/games/:game_id/place', async (req, res) => {
    const { ship_size, start_row, start_col, end_row, end_col } = req.body;
    const user = req.user;
    const shipManager = req.shipManager;
    const result = await shipManager.placeShip(user.id, ship_size, start_row, end_row, start_col, end_col);
    if (result instanceof Result_1.Failure) {
        return res.status(result.status).json({ msg: result.msg });
    }
    const finalResult = result;
    return res.status(200).json({ msg: finalResult.result });
});
// Unplace a ship
gameRouter.delete('/games/:game_id/place', async (req, res) => {
    const { ship_size, start_row, start_col, end_row, end_col } = req.body;
    const user = req.user;
    const shipManager = req.shipManager;
    const result = await shipManager.unplaceShip(user.id, ship_size, start_row, end_row, start_col, end_col);
    if (result instanceof Result_1.Failure) {
        return res.status(result.status).json({ msg: result.msg });
    }
    const finalResult = result;
    return res.status(200).json({ msg: finalResult.result });
});
// Game state change to ready / turn
gameRouter.post('/games/:game_id/ready', async (req, res) => {
    const user = req.user;
    const game = req.game;
    const result = await game.userIsReady(user.id);
    if (result instanceof Result_1.Failure) {
        return res.status(result.status).json({ msg: result.msg });
    }
    return res.status(200).json({ msg: 'game state updated' });
});
// Player performs a shot
gameRouter.post('/games/:game_id/shoot', async (req, res) => {
    const { row, col } = req.body;
    const user = req.user;
    const game = req.game;
    const shotResult = await game.userShoot(user.id, row, col);
    if (shotResult instanceof Result_1.Failure) {
        return res.status(shotResult.status).json({ msg: shotResult.msg });
    }
    const shot = shotResult;
    return res.status(200).json({ msg: shot.result });
});
// Chat api
gameRouter.post('/games/:game_id/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ msg: 'Cannot send an empty message' });
    }
    const user = req.user;
    const game = req.game;
    const chatManager = game.getGameChatManager();
    const chatResult = await chatManager.postNewGameMsg(user.id, message);
    if (chatResult instanceof Result_1.Failure) {
        return res.status(chatResult.status).json({ msg: chatResult.msg });
    }
    const result = chatResult;
    return res.status(200).json({ msg: result.result });
});
gameRouter.get('/games/:game_id/chat', async (req, res) => {
    const game = req.game;
    const chatManager = game.getGameChatManager();
    const chatResult = await chatManager.getGameChat();
    if (chatResult instanceof Result_1.Failure) {
        return res.status(chatResult.status).json({ msg: chatResult.msg });
    }
    const result = chatResult;
    return res.status(200).json(result.result);
});
// Getting game info
gameRouter.get('/games/:game_id', async (req, res) => {
    const user = req.user;
    const game = req.game;
    const result = await game.getGameInfo(user.id);
    if (result instanceof Result_1.Failure) {
        return res.status(result.status).json({ msg: result.msg });
    }
    const gameInfo = result;
    return res.status(200).json(gameInfo.result);
});
module.exports = gameRouter;
