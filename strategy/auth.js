import passport from "passport";
import { Strategy as localStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import dotenv from "dotenv";

import Users from "../models/user.model.js";

dotenv.config();

// bcrypt passport jsonwebtoken passport-jwt passport-local
passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await Users.create({...req.body, status:"pending",role:"emp" });
        
        return done(null, user);
      } catch (err) {
        console.log(err);
        done(err);
      }
    }
  )
);

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await Users.findOne({ email });

        if (!user) return done(null, false, { message: "invalid credentials" });
        if (user.status === "block"||user.status === "deleted"||user.status === "pending")
          return done(null, false, { message: "invalid credentials" });
        const validate = await user.isValidPassword(password);

        if (!validate)
          return done(null, false, { message: "invalid credentials" });

        return done(null, user, { message: "Logged in Successfully" });
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);