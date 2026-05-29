const AppError = require('../utils/AppError');

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  next();
}

module.exports = {
  requireAdmin,
};
