const AppError = require('../utils/AppError');

function requireDoctor(req, res, next) {
  if (!req.user || (req.user.role !== 'doctor' && req.user.role !== 'admin')) {
    return next(new AppError('Clinical access required', 403));
  }

  next();
}

module.exports = {
  requireDoctor,
};
