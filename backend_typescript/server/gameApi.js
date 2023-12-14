"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const gameRouter = express.Router();
const Result_1 = require("../models/Result");
const multer = require('multer');
const path = require('path');
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
    try {
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
    }
    catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
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
module.exports = gameRouter;
