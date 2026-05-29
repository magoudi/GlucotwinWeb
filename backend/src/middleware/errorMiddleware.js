function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(err, req, res, next) {
  void next;
  const statusCode = err.statusCode || err.status || (err.name === 'ValidationError' ? 400 : 500);

  if (statusCode >= 500 && process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  if (err.code === 11000) {
    res.status(409).json({ success: false, error: 'A record with this value already exists', code: 'DUPLICATE' });
    return;
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => error.message);
    res.status(400).json({ success: false, error: errors[0] || 'Validation failed', errors, code: 'VALIDATION' });
    return;
  }

  res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 ? 'Server error' : err.message,
    code: statusCode >= 500 ? 'SERVER_ERROR' : 'REQUEST_ERROR',
  });
}

module.exports = {
  errorHandler,
  notFound,
};
