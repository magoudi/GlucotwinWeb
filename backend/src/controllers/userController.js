const AppError = require('../utils/AppError');
const userStore = require('../services/userStore');
const { initialsForName, safeUser } = require('../utils/userResponse');

const allowedProfileFields = [
  'fullName',
  'username',
  'phone',
  'bio',
  'subtitle',
  'dateOfBirth',
  'diabetesType',
  'managementType',
  'glucoseUnit',
  'targetGlucoseMin',
  'targetGlucoseMax',
  'carbRatio',
  'correctionFactor',
  'insulinSensitivity',
  'basalProfile',
];

async function getMe(req, res) {
  res.json({ user: safeUser(req.user) });
}

async function updateMe(req, res, next) {
  try {
    const updates = {};

    allowedProfileFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (updates.fullName) {
      updates.fullName = String(updates.fullName).trim();
      updates.initials = initialsForName(updates.fullName);
    }

    if (updates.username) {
      updates.username = String(updates.username).trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    }

    const user = await userStore.updateById(req.user._id, updates);

    res.json({ user: safeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    const user = await userStore.findByIdForAuth(req.user._id);

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    if (!(await user.checkPassword(currentPassword))) {
      throw new AppError('Current password is incorrect', 401);
    }

    if (await user.checkPassword(newPassword)) {
      throw new AppError('New password must be different from current password', 400);
    }

    await user.setPassword(newPassword);
    await userStore.saveUser(user);

    res.json({ ok: true, passwordUpdatedAt: user.updatedAt });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  changePassword,
  getMe,
  updateMe,
};
