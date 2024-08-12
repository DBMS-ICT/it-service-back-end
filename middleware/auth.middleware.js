import passport from "passport";

export const signUpMiddleware = passport.authenticate("signup", {
  session: false,
});

export const protect = passport.authenticate("jwt", { session: false });