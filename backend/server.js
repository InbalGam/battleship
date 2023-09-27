const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oidc');
const store = new session.MemoryStore();
const db = require('./server/db');
const {comparePasswords} = require('./hash');

module.exports = app;

const PORT = process.env.PORT || 4001;

app.use(morgan('short'));
// middleware for handling CORS requests from index.html
app.use(cors(
  {origin : process.env.CORS_ORIGIN, //(Whatever the frontend url is) 
  credentials: true, // <= Accept credentials (cookies) sent by the client
}
));


// middleware for parsing request bodies here:
app.use(bodyParser.json());


// middlewares for authentication
app.set('trust proxy', 1);
app.use(
  session({
    secret: "f4z4gs$Gcg",
    cookie: { maxAge: 300000000, httpOnly: true, secure: true, sameSite: 'none' },
    saveUninitialized: false,
    resave: false,
    store,
  })
);


app.use(passport.initialize());
app.use(passport.session());


passport.use(
  new LocalStrategy(async function (username, password, done) {
    try {
      const results = await db.getUsername(username);
      console.log('the results' + results);
      if (results.length === 0) {
        return done(null, false);
      }
      const passwordCheck = await comparePasswords(password, results[0].password);
      if (!passwordCheck) {
        return done(null, false);
      }
      return done(null, results[0]);
    }
    catch (e) {
      done(e);
    }
  })
);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/oauth2/redirect/google'
},
  async function (issuer, profile, done) {
    try {
      const check = await db.getFromFederatedCredentials(issuer, profile.id);
      if (check.length === 0) {
        // The Google account has not logged in to this app before.
        // Create a new user record and link it to the Google account.
        const timestamp = new Date(Date.now());
        const user = await db.insertToUsers(profile.emails[0].value, profile.displayName, null, timestamp);
        await db.insertFederatedCredentials(user[0].id, issuer, profile.id);
        return done(null, user[0]);
      } else {
        // The Google account has previously logged in to the app.  Get the
        // user record linked to the Google account and log the user in.
        const result = await db.getUser(check.rows[0].user_id);
        if (result.length === 0) {
          return done(null, false);
        }
        return done(null, result[0]);
      }
    } 
    catch(e) {
      done(e);
    }
  }
));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const results = await db.getUser(id);
    done(null, results[0]);
  } catch(e) {
    done(e);
  }
});


// Start auth router
const authRouter = require('./server/auth_api');
app.use('/', authRouter);

// Start app routers
const gameRouter = require('./server/game_api');
app.use('/', gameRouter);


// This conditional is here for testing purposes:
if (!module.parent) { 
  // start the server listening at PORT below:
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}
