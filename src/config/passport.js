// src/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import User from '../models/User.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user already exists
        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id }, 
            { email: profile.emails[0].value }
          ]
        });

        if (user) {
          // If user exists but doesn't have a googleId, link it
          if (!user.googleId) {
            user.googleId = profile.id;
            user.avatar = profile.photos[0]?.value;
            await user.save();
          }
          return done(null, user);
        }

        // 2. New user? Create them
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value,
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// We don't need sessions (JWT-based), but Passport requires these if using certain flows
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

export default passport;
