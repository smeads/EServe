const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/keys');
const mongoose = require('mongoose');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  console.log('serialize', user);
  console.log('serialize', user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

// Pass OAuth Client ID and Client Secret to GoogleStrategy
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleID: profile.id })
        .then(existingUser => {
          if (existingUser) {
            console.log('existing user', existingUser);
            done(null, existingUser);
          } else {
            new User({ googleID: profile.id })
              .save()
              .then(user => {
                console.log('user', user);
                done(null, user)
              });
          }
        });
    }
  )
);
