const express = require('express');
const authRouter = express.Router();
const db = require('./db');
const passport = require("passport");
const {passwordHash} = require('../hash');
const {validateEmail} = require('../utils');

// Registering a user
authRouter.post('/register', async (req, res) => {
    const {username, password, nickname} = req.body;

    if (!validateEmail(username)) {
        return res.status(400).json({msg: 'Email is not valid'});
    };

    if (password.length < 8) {
        return res.status(400).json({msg: 'Password needs to be at least 8 characters'});
    }

    if (!nickname) {
        return res.status(400).json({msg: 'Nickname must be specified'});
    }

    try {
        const check = await db.getUsername(username);
        if (check.length > 0) {
            return res.status(400).json({msg: 'Email already exist, choose a different email'});
        }

        const hashedPassword = await passwordHash(password, 10);
        const timestamp = new Date(Date.now());
        await db.insertToUsers(username, nickname, hashedPassword, timestamp);
        return res.status(201).json({msg: 'Success creating user'});
    } catch(e) {
        res.status(500).json({msg: 'Server error'});
    }
});

// Login a user - local strategy
authRouter.get("/login", (req, res) => {
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
authRouter.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      //res.redirect('/');
      res.status(200).json({msg: 'Successfully logged out'})
    });
});


module.exports = authRouter;