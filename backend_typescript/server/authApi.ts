import { Failure, Success } from "../models/Result";
import { userManager } from "../globals";

import { NextFunction, Request, Response } from 'express';
const express = require('express');
const authRouter = express.Router();
const passport = require("passport");


interface RegisterBody {
    username: string;
    password: string;
    nickname: string;
}

// Registering a user
authRouter.post('/register', async (req: Request, res: Response) => {
    const {username, password, nickname}: RegisterBody = req.body;
    const result = await userManager.register(username, nickname, password);
    if (result instanceof Failure) {
        return res.status(result.status).json({msg: result.msg});
    } else if (result instanceof Success) {
        return res.status(201).json(result.result);
    }
});

// Login a user - local strategy
authRouter.get("/login", (req: Request, res: Response) => {
    res.status(401).json({msg: 'Authentication failed'});
});


authRouter.post("/login",
    passport.authenticate("local", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("/profile");
    }
);


// Login a user - using Google
authRouter.get('/login/google', passport.authenticate('google', {
    scope: ['email', 'profile']
}));


authRouter.get('/oauth2/redirect/google',
  passport.authenticate('google', { failureRedirect: `${process.env.CORS_ORIGIN}/login`, failureMessage: true }),
  (req, res) => {
    res.redirect(`${process.env.CORS_ORIGIN}/profile`);
});


// Logout user
authRouter.get('/logout', function(req, res: Response, next: NextFunction){
    req.logout((err) => {
      if (err) { return next(err); }
      res.status(200).json({msg: 'Successfully logged out'})
    });
});


module.exports = authRouter;