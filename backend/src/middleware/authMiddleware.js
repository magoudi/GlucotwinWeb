const AppError = require('../utils/AppError');
const userStore = require('../services/userStore');
const { verifyToken } = require('../utils/auth');

async function protect(req, res, next) {
  try {
    let token;

    if (req.cookies && (req.cookies.impersonation_token || req.cookies.token)) {
      token = req.cookies.impersonation_token || req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Authentication token is required', 401);
    }

    const payload = verifyToken(token);
    const user = await userStore.findById(payload.sub);

    if (!user) {
      throw new AppError('Authenticated user no longer exists', 401);
    }

    req.user = user;
    req.auth = payload;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired authentication token', 401));
      return;
    }

    next(error);
  }
}

module.exports = {
  protect,
};
