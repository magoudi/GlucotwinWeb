const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.patch(
  '/me/password',
  validateBody({
    currentPassword: { required: true, label: 'Current password' },
    newPassword: { required: true, type: 'password', label: 'New password' },
  }),
  userController.changePassword,
);

module.exports = router;
