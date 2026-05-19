const AppError = require('../utils/AppError');

function validateBody(rules) {
  return (req, res, next) => {
    const errors = [];

    Object.entries(rules).forEach(([field, rule]) => {
      const value = req.body[field];

      if (rule.required && (value === undefined || value === null || String(value).trim() === '')) {
        errors.push(`${rule.label || field} is required`);
        return;
      }

      if (value === undefined || value === null || value === '') {
        return;
      }

      if (rule.type === 'email' && !/^\S+@\S+\.\S+$/.test(String(value).trim())) {
        errors.push('Enter a valid email');
      }

      if (rule.type === 'password') {
        const password = String(value);
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
          errors.push('Password must be at least 8 characters and include uppercase, lowercase, and number');
        }
      }
    });

    if (errors.length) {
      next(new AppError(errors[0], 400));
      return;
    }

    next();
  };
}

module.exports = {
  validateBody,
};
