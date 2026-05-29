const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 50,
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const passwordResetRequestLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: isProduction ? 5 : 50, // Limit each IP to 5 password reset requests per windowMs
  message: {
    success: false,
    message: 'Too many password reset requests from this IP, please try again after 30 minutes',
    code: 'RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 10 : 50, // Limit each IP to 10 verification attempts per windowMs
  message: {
    success: false,
    message: 'Too many verification attempts from this IP, please try again later',
    code: 'RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  passwordResetRequestLimiter,
  passwordResetVerifyLimiter
};
