const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validate');
const { loginLimiter, passwordResetRequestLimiter, passwordResetVerifyLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post(
  '/register',
  validateBody({
    fullName: { required: true, label: 'Full name' },
    email: { required: true, type: 'email', label: 'Email' },
    password: { required: true, type: 'password', label: 'Password' },
  }),
  authController.register,
);

router.post(
  '/login',
  loginLimiter,
  authController.login,
);

router.post('/logout', authController.logout);
router.post('/stop-impersonating', protect, authController.stopImpersonating);

router.get('/me', protect, authController.me);

router.post('/password-reset/request-code', passwordResetRequestLimiter, authController.requestCode);
router.post('/password-reset/verify-code', passwordResetVerifyLimiter, authController.verifyCode);
router.post('/password-reset/confirm', authController.confirmReset);

module.exports = router;
