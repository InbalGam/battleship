import { Failure, Success } from "./models/Result";
import { userManager } from "./globals";
import User from "./models/User";

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


module.exports = app;

const PORT = process.env.PORT || 4001;

app.use(morgan('short'));
// middleware for handling CORS requests from index.html
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN, //(Whatever the frontend url is) 
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
        cookie: { maxAge: 300000000, httpOnly: true },//, secure: true, sameSite: 'none' },
        saveUninitialized: false,
        resave: false,
        store,
    })
);


app.use(passport.initialize()); // initializing passport middlewares
app.use(passport.session()); // initializing session for user data management


passport.use(
  new LocalStrategy(async (username: string, password: string, done) => {
      const result = await userManager.authenticate(username, password);
      if (result instanceof Failure) {
          return done(null, false);
      } else if (result instanceof Success) {
          return done(null, result.result);
      }
  })
);


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/oauth2/redirect/google'
},
  async (issuer, profile, done) => {
      const result = await userManager.googleAuthenticate(issuer, profile.id, profile.emails[0].value, profile.displayName);
      if (result instanceof Failure) {
          return done(null, false);
      } else if (result instanceof Success) {
          return done(null, result.result);
      }
  }
));


passport.serializeUser((user: User, done) => {
  done(null, user.getUserId());
});


passport.deserializeUser(async (id: number, done) => {
  const result = await userManager.getUserById(id);
  if (result instanceof Failure) {
      return done(result.msg);
  } else if (result instanceof Success) {
      return done(null, result.result);
  }
});


// Start auth router
const authRouter = require('./server/authApi');
app.use('/', authRouter);

// // Start app routers
const gameRouter = require('./server/gameApi');
app.use('/', gameRouter);

// start the server listening at PORT below:
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
