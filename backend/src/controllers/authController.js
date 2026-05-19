const AppError = require('../utils/AppError');
const { signToken } = require('../utils/auth');
const userStore = require('../services/userStore');
const { safeUser } = require('../utils/userResponse');
const auditLog = require('../services/auditLog');
const { verifyToken } = require('../utils/auth');
const crypto = require('crypto');
const emailService = require('../services/emailService');

function cookieOptions() {
  return {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
}

function expiredCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0)
  };
}

function safeActor(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    role: user.role,
  };
}

async function buildSession(req) {
  if (!req.auth || !req.auth.impersonator) {
    return {
      isImpersonating: false,
      impersonator: null,
    };
  }

  const impersonator = await userStore.findById(req.auth.impersonator);

  return {
    isImpersonating: true,
    impersonator: safeActor(impersonator),
  };
}

async function sendTokenResponse(user, statusCode, req, res) {
  const token = signToken(user);
  const session = await buildSession(req);

  res.status(statusCode).cookie('token', token, cookieOptions()).json({
    user: safeUser(user),
    session,
  });
}

async function register(req, res, next) {
  try {
    const fullName = String(req.body.fullName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const role = String(req.body.role || '').trim().toLowerCase();

    // Validate role
    if (!role) {
      throw new AppError('Role is required. Choose "patient" or "doctor".', 400, 'VALIDATION_ERROR');
    }
    if (!['patient', 'doctor'].includes(role)) {
      throw new AppError('Invalid role. Only "patient" or "doctor" are allowed for public registration.', 400, 'VALIDATION_ERROR');
    }

    const userData = {
      fullName,
      email,
      password,
      role,
    };

    // Patient-specific fields
    if (role === 'patient') {
      userData.diabetesType = req.body.diabetesType || '';
      userData.managementType = req.body.managementType || 'unknown';
      userData.glucoseUnit = req.body.glucoseUnit || 'mg/dL';
      if (req.body.targetGlucoseMin) userData.targetGlucoseMin = Number(req.body.targetGlucoseMin);
      if (req.body.targetGlucoseMax) userData.targetGlucoseMax = Number(req.body.targetGlucoseMax);
      if (req.body.carbRatio) userData.carbRatio = Number(req.body.carbRatio);
      if (req.body.correctionFactor) userData.correctionFactor = Number(req.body.correctionFactor);
      if (req.body.insulinSensitivity) userData.insulinSensitivity = Number(req.body.insulinSensitivity);
    }

    // Doctor-specific fields
    if (role === 'doctor') {
      userData.specialty = req.body.specialty || '';
      userData.clinicName = req.body.clinicName || '';
      userData.licenseNumber = req.body.licenseNumber || '';
    }

    const user = await userStore.createUser(userData);

    auditLog.log(user._id.toString(), 'user.register', user._id.toString(), `User registered as ${role}`);
    await sendTokenResponse(user, 201, req, res);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const identifier = String(req.body.identifier || req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!identifier) {
      throw new AppError('Email or username is required', 400);
    }

    if (!password) {
      throw new AppError('Password is required', 400);
    }

    const user = await userStore.findByLoginForAuth(identifier);

    if (!user || !(await user.checkPassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    auditLog.log(user._id.toString(), 'user.login', user._id.toString(), 'User logged in successfully');
    await sendTokenResponse(user, 200, req, res);
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    res.json({
      user: safeUser(req.user),
      session: await buildSession(req),
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.cookie('token', 'none', expiredCookieOptions());
  res.cookie('impersonation_token', 'none', expiredCookieOptions());
  res.json({ success: true, message: 'Logged out' });
}

async function stopImpersonating(req, res, next) {
  try {
    if (!req.auth || !req.auth.impersonator) {
      throw new AppError('No active impersonation session found', 400);
    }

    let originalUser = null;
    const baseToken = req.cookies ? req.cookies.token : null;

    if (baseToken) {
      const payload = verifyToken(baseToken);
      originalUser = await userStore.findById(payload.sub);
    }

    auditLog.log(
      req.auth.impersonator,
      'user.impersonation.stop',
      req.user._id.toString(),
      `Ended impersonation session for ${req.user.email}`,
    );

    res.cookie('impersonation_token', 'none', expiredCookieOptions()).json({
      success: true,
      message: 'Impersonation stopped',
      user: originalUser ? safeUser(originalUser) : null,
      session: {
        isImpersonating: false,
        impersonator: null,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function requestCode(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email) {
      throw new AppError('Email is required', 400, 'VALIDATION_ERROR');
    }

    const user = await userStore.findByEmailForAuth(email);

    if (!user) {
      res.json({ success: true, message: 'If this email exists, a verification code has been sent.' });
      return;
    }

    const rawCode = crypto.randomInt(100000, 999999).toString();
    const secret = process.env.PASSWORD_RESET_SECRET || 'fallback_secret_for_dev_only';
    const codeHash = crypto.createHash('sha256').update(`${email}:${rawCode}:${secret}`).digest('hex');

    user.passwordResetCodeHash = codeHash;
    user.passwordResetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetCodeAttempts = 0;
    user.passwordResetCodeLastSentAt = new Date();
    await userStore.saveUser(user);

    await emailService.sendPasswordResetCode({ to: email, code: rawCode, expiresInMinutes: 10 });
    
    auditLog.log(user._id.toString(), 'user.password_reset.code_requested', user._id.toString(), 'PASSWORD_RESET_CODE_REQUESTED');

    const responsePayload = { success: true, message: 'If this email exists, a verification code has been sent.' };
    
    if (process.env.NODE_ENV === 'test') {
      responsePayload.resetCode = rawCode;
    }

    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
}

async function verifyCode(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const code = String(req.body.code || '').trim();

    if (!email || !code) {
      throw new AppError('Email and code are required', 400, 'VALIDATION_ERROR');
    }

    const user = await userStore.findByEmailForAuth(email);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.', code: 'PASSWORD_RESET_CODE_INVALID' });
    }

    if (!user.passwordResetCodeHash || !user.passwordResetCodeExpiresAt || user.passwordResetCodeExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.', code: 'PASSWORD_RESET_CODE_EXPIRED' });
    }

    if (user.passwordResetCodeAttempts >= 5) {
      return res.status(400).json({ success: false, message: 'Too many attempts. Request a new code.', code: 'PASSWORD_RESET_TOO_MANY_ATTEMPTS' });
    }

    const secret = process.env.PASSWORD_RESET_SECRET || 'fallback_secret_for_dev_only';
    const codeHash = crypto.createHash('sha256').update(`${email}:${code}:${secret}`).digest('hex');

    if (user.passwordResetCodeHash !== codeHash) {
      user.passwordResetCodeAttempts += 1;
      await userStore.saveUser(user);
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.', code: 'PASSWORD_RESET_CODE_INVALID' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetSessionTokenHash = resetTokenHash;
    user.passwordResetSessionExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetVerifiedAt = new Date();
    user.passwordResetCodeHash = null;
    await userStore.saveUser(user);
    
    auditLog.log(user._id.toString(), 'user.password_reset.code_verified', user._id.toString(), 'PASSWORD_RESET_CODE_VERIFIED');

    res.json({ success: true, message: 'Code verified successfully.', resetToken });
  } catch (error) {
    next(error);
  }
}

async function confirmReset(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const resetToken = String(req.body.resetToken || '').trim();
    const newPassword = String(req.body.newPassword || '');

    if (!email || !resetToken || !newPassword) {
      throw new AppError('Email, reset token, and new password are required', 400, 'VALIDATION_ERROR');
    }

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      throw new AppError('Password must be at least 8 characters and include uppercase, lowercase, and number', 400, 'VALIDATION_ERROR');
    }

    const user = await userStore.findByEmailForAuth(email);

    if (!user || !user.passwordResetSessionTokenHash || !user.passwordResetSessionExpiresAt || user.passwordResetSessionExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset session.', code: 'PASSWORD_RESET_TOKEN_INVALID' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    if (user.passwordResetSessionTokenHash !== resetTokenHash) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset session.', code: 'PASSWORD_RESET_TOKEN_INVALID' });
    }

    await user.setPassword(newPassword);

    user.passwordResetCodeHash = null;
    user.passwordResetCodeExpiresAt = null;
    user.passwordResetCodeAttempts = 0;
    user.passwordResetSessionTokenHash = null;
    user.passwordResetSessionExpiresAt = null;
    user.passwordResetVerifiedAt = null;
    await userStore.saveUser(user);

    auditLog.log(user._id.toString(), 'user.password_reset.completed', user._id.toString(), 'PASSWORD_RESET_COMPLETED');

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requestCode,
  verifyCode,
  confirmReset,
  login,
  me,
  register,
  logout,
  stopImpersonating,
};
