const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(
    user.isAdmin !== undefined,
    "createToken passed user without isAdmin property"
  );
  console.assert(
    user.isFlagged !== undefined,
    "createToken passed user without isFlagged property"
  );

  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
    isFlagged: user.isFlagged || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
