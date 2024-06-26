"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware: Requires user is authenticated. */
function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) {
      throw new UnauthorizedError();
    }
    if (res.locals.user.isFlagged) {
      throw new UnauthorizedError("Your account has been flagged");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be logged in and an admin.
 *
 *  If not, raises Unauthorized.
 */
function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || res.locals.user.isAdmin === false) {
      throw new UnauthorizedError();
    }
    if (res.locals.user.isFlagged) {
      throw new UnauthorizedError("Your account has been flagged");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be logged in and either an admin or a user with the same usermame as the request parameters.
 *
 *  If not, raises Unauthorized.
 */

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user;
    if (!(user && (user.isAdmin || user.username === req.params.username))) {
      throw new UnauthorizedError("Incorrect user or not admin!");
    }
    if (res.locals.user.isFlagged) {
      throw new UnauthorizedError("Your account has been flagged");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureCorrectUsers(req, res, next) {
  try {
    if (
      res.locals.user.username !== req.params.userOne &&
      res.locals.user.username !== req.params.userTwo
    ) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
  ensureCorrectUsers,
};
