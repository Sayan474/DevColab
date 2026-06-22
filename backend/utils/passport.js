import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {

      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {

        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          
          user.googleId = profile.id;
          if (!user.avatar) user.avatar = profile.photos[0].value;
          await user.save();
        } else {
          
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value
          });
        }
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));


passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback',
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {

      let email = profile.emails && profile.emails.length > 0 
        ? profile.emails[0].value 
        : `${profile.username}@github.com`;
        
      let user = await User.findOne({ githubId: profile.id });

      if (!user) {
        user = await User.findOne({ email: email });
        
        if (user) {

          user.githubId = profile.id;
          if (!user.avatar) user.avatar = profile.photos && profile.photos[0].value;
          await user.save();
        } else {

          user = await User.create({
            githubId: profile.id,
            name: profile.displayName || profile.username,
            email: email,
            avatar: profile.photos && profile.photos[0].value
          });
        }
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

export default passport;