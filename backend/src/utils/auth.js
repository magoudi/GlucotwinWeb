const jwt = require('jsonwebtoken');
const { jwtExpiresIn, jwtSecret } = require('../config/env');

function signToken(user, impersonator = null) {
  const payload = {
    sub: user._id.toString(),
    role: user.role,
  };

  if (impersonator) {
    payload.impersonator = impersonator;
  }

  return jwt.sign(
    payload,
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = {
  signToken,
  verifyToken,
};
