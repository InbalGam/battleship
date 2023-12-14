"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Result_1 = require("../models/Result");
const globals_1 = require("../globals");
const express = require('express');
const authRouter = express.Router();
const passport = require("passport");
// Registering a user
authRouter.post('/register', async (req, res) => {
    const { username, password, nickname } = req.body;
    const result = await globals_1.userManager.register(username, nickname, password);
    if (result instanceof Result_1.Failure) {
        return res.status(result.status).json({ msg: result.msg });
    }
    else if (result instanceof Result_1.Success) {
        return res.status(201).json({ msg: 'Success creating user' });
    }
});
// Login a user - local strategy
authRouter.get("/login", (req, res) => {
    res.status(401).json({ msg: 'Authentication failed' });
});
authRouter.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/profile");
});
// Login a user - using Google
authRouter.get('/login/google', passport.authenticate('google', {
    scope: ['email', 'profile']
}));
authRouter.get('/oauth2/redirect/google', passport.authenticate('google', { failureRedirect: `${process.env.CORS_ORIGIN}/login`, failureMessage: true }), (req, res) => {
    res.redirect(`${process.env.CORS_ORIGIN}/profile`);
});
// Logout user
authRouter.get('/logout', function (req, res, next) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.status(200).json({ msg: 'Successfully logged out' });
    });
});
module.exports = authRouter;
