const express = require('express');
const authRouter = express.Router();
const {pool} = require('./db');
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
        const check = await pool.query('select * from users where username = $1', [username]);
        if (check.rows.length > 0) {
            return res.status(400).json({msg: 'Email already exist, choose a different email'});
        }

        const hashedPassword = await passwordHash(password, 10);
        const timestamp = new Date(Date.now());
        await pool.query('INSERT INTO users (username, nickname, password, created_at) VALUES ($1, $2, $3, $4) returning *', [username, nickname, hashedPassword, timestamp]);
        return res.status(201).json({msg: 'Success creating user'});
    } catch(e) {
        res.status(500);
    }
});

// Login a user - local strategy
authRouter.get("/login", (req, res) => {
    res.status(401).json({msg: 'Authentication failed'});
});


// Get user profile page
authRouter.get("/profile", async (req, res) => {
    try {
        const result = await pool.query('select * from users where id = $1', [req.user.id]);
        const userData = {
            username: result.rows[0].username,
            nickname: result.rows[0].nickname,
            user_score: {
                wins: result.rows[0].wins,
                loses: result.rows[0].loses
            }
        }
        res.status(200).json(userData);
    } catch (e) {
        res.status(500);
    }
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



// Update user profile page
authRouter.put('/profile', async (req, res, next) => { 
    const { nickname } = req.body;

    try {
        const timestamp = new Date(Date.now());
        await pool.query('update users set nickname = $2, modified_at = $3 where id = $1;', [req.user.id, nickname, timestamp]);
        res.status(200).json({ msg: 'Updated user' });
    } catch(e) {
        res.status(500);
    }
});

module.exports = authRouter;