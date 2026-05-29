const AppError = require('../utils/AppError');
const auditLog = require('../services/auditLog');
const userStore = require('../services/userStore');
const announcementStore = require('../services/announcementStore');
const systemSettingsStore = require('../services/systemSettingsStore');
const { initialsForName, safeUser } = require('../utils/userResponse');
const { z } = require('zod');

const basalProfileSchema = z.array(z.object({
  startTime: z.string().min(1),
  rate: z.number().finite().min(0).max(25),
})).max(24);

const adminUserUpdateSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  username: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().email().optional(),
  role: z.enum(['patient', 'doctor', 'admin']).optional(),
  phone: z.string().trim().max(40).optional(),
  bio: z.string().trim().max(500).optional(),
  subtitle: z.string().trim().max(120).optional(),
  dateOfBirth: z.string().nullable().optional(),
  diabetesType: z.string().trim().max(80).optional(),
  managementType: z.enum(['pump', 'injections', 'unknown']).optional(),
  glucoseUnit: z.enum(['mmol/L', 'mg/dL']).optional(),
  targetGlucoseMin: z.number().finite().min(40).max(400).optional(),
  targetGlucoseMax: z.number().finite().min(40).max(400).optional(),
  carbRatio: z.number().finite().min(1).max(100).optional(),
  correctionFactor: z.number().finite().min(1).max(200).optional(),
  insulinSensitivity: z.number().finite().min(1).max(200).optional(),
  basalProfile: basalProfileSchema.optional(),
  featureFlags: z.record(z.string(), z.boolean()).optional(),
}).strict();

function parseOrThrow(schema, payload) {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  return parsed.data;
}

async function stats(req, res, next) {
  try {
    const [users, roleCounts, total] = await Promise.all([
      userStore.listAllUsers(),
      userStore.countByRole(),
      userStore.totalCount(),
    ]);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = users
      .filter((u) => new Date(u.createdAt) >= weekAgo)
      .map(safeUser);

    const diabetesBreakdown = {};
    users.forEach((u) => {
      const dt = u.diabetesType || 'Not specified';
      diabetesBreakdown[dt] = (diabetesBreakdown[dt] || 0) + 1;
    });

    const roleMap = {};
    (Array.isArray(roleCounts) ? roleCounts : []).forEach((r) => {
      roleMap[r._id] = r.count;
    });

    // Mock engagement analytics
    const engagement = {
      dau: Math.max(1, Math.floor(total * 0.4)), // 40% daily active
      mau: Math.max(1, Math.floor(total * 0.85)), // 85% monthly active
      simulationsRunToday: Math.floor(Math.random() * 50) + 10,
    };

    res.json({
      totalUsers: total,
      newUsersThisWeek: recentUsers.length,
      roleBreakdown: roleMap,
      diabetesBreakdown,
      recentRegistrations: recentUsers.slice(0, 10),
      engagement,
    });
  } catch (error) {
    next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const search = req.query.search || '';
    const users = await userStore.listAllUsers(search || undefined);
    res.json({ users: users.map(safeUser) });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await userStore.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user: safeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const targetUser = await userStore.findById(req.params.id);

    if (!targetUser) {
      throw new AppError('User not found', 404);
    }
    const updates = parseOrThrow(adminUserUpdateSchema, req.body);

    if (Object.keys(updates).length === 0) {
      throw new AppError('Provide at least one valid field to update', 400);
    }

    if (updates.fullName) {
      updates.fullName = String(updates.fullName).trim();
      updates.initials = initialsForName(updates.fullName);
    }

    if (updates.role && req.params.id === req.user._id.toString() && updates.role !== 'admin') {
      throw new AppError('You cannot remove your own admin access', 400);
    }

    const oldRole = targetUser.role;

    if (updates.role === 'admin' && oldRole !== 'admin') {
      const existingAdminCount = await userStore.countUsersByRole('admin');

      if (existingAdminCount >= 1) {
        throw new AppError('Only one admin account is allowed. Reassign the current admin before promoting another user.', 400);
      }
    }

    if (oldRole === 'admin' && updates.role && updates.role !== 'admin') {
      const otherAdminCount = await userStore.countUsersByRole('admin', req.params.id);

      if (otherAdminCount < 1) {
        throw new AppError('The platform must always keep one admin account.', 400);
      }
    }

    const user = await userStore.updateById(req.params.id, updates);

    if (updates.role && updates.role !== oldRole) {
      auditLog.log(
        req.user._id.toString(),
        'user.role-change',
        req.params.id,
        `Changed role from "${oldRole}" to "${updates.role}"`,
      );
    }

    auditLog.log(
      req.user._id.toString(),
      'user.update',
      req.params.id,
      `Updated fields: ${Object.keys(updates).join(', ')}`,
    );

    res.json({ user: safeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user._id.toString()) {
      throw new AppError('You cannot delete your own admin account', 400);
    }

    const targetUser = await userStore.findById(req.params.id);

    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    if (targetUser.role === 'admin') {
      const otherAdminCount = await userStore.countUsersByRole('admin', req.params.id);

      if (otherAdminCount < 1) {
        throw new AppError('The platform must always keep one admin account.', 400);
      }
    }

    const user = await userStore.deleteById(req.params.id);

    auditLog.log(
      req.user._id.toString(),
      'user.delete',
      req.params.id,
      `Deleted user "${user.fullName}" (${user.email})`,
    );

    res.json({ ok: true, deletedUser: safeUser(user) });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const newPassword = parseOrThrow(
      z.object({
        newPassword: z.string().min(8).regex(/[A-Z]/, 'Password must include an uppercase letter').regex(/[a-z]/, 'Password must include a lowercase letter').regex(/[0-9]/, 'Password must include a number'),
      }).strict(),
      req.body,
    ).newPassword;

    const user = await userStore.findByIdForAuth(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.setPassword(newPassword);
    await userStore.saveUser(user);

    auditLog.log(
      req.user._id.toString(),
      'user.password-reset',
      req.params.id,
      `Admin reset password for "${user.fullName}"`,
    );

    res.json({ ok: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
}

async function getAudit(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const entries = await auditLog.getAll(limit);
    res.json({ entries });
  } catch (error) {
    next(error);
  }
}

async function verifyAuditIntegrity(req, res, next) {
  try {
    const result = await auditLog.verifyAuditChain();
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

function systemInfo(req, res) {
  res.json({
    databaseMode: userStore.getDatabaseMode(),
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: {
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  });
}

const { signToken } = require('../utils/auth');

async function impersonateUser(req, res, next) {
  try {
    const user = await userStore.findByIdForAuth(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const token = signToken({
      ...user.toObject(), // Needs _id for signToken
      _id: user._id,
      role: user.role,
    }, req.user._id.toString()); // Passing impersonator

    auditLog.log(
      req.user._id.toString(),
      'user.impersonate',
      user._id.toString(),
      `Admin logged in as ${user.email}`,
    );

    const options = {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('impersonation_token', token, options).json({
      user: safeUser(user),
      session: {
        isImpersonating: true,
        impersonator: {
          id: req.user._id.toString(),
          fullName: req.user.fullName,
          role: req.user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function exportUsers(req, res, next) {
  try {
    const users = await userStore.listAllUsers();
    
    // Header
    let csv = 'ID,Name,Email,Role,DiabetesType,GlucoseUnit,CreatedAt\n';
    
    users.forEach((u) => {
      csv += `${u._id},"${u.fullName}","${u.email}",${u.role},"${u.diabetesType || ''}",${u.glucoseUnit},${u.createdAt}\n`;
    });

    auditLog.log(req.user._id.toString(), 'export.users', null, 'Exported all users to CSV');

    res.header('Content-Type', 'text/csv');
    res.attachment('users.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

async function exportAnonymized(req, res, next) {
  try {
    const users = await userStore.listAllUsers();
    const crypto = require('crypto');
    
    // Header
    let csv = 'AnonID,Role,DiabetesType,ManagementType,GlucoseUnit,TargetMin,TargetMax,CarbRatio,CorrectionFactor,InsulinSensitivity\n';
    
    users.forEach((u) => {
      const anonId = crypto.createHash('sha256').update(u._id.toString()).digest('hex').substring(0, 16);
      csv += `${anonId},${u.role},"${u.diabetesType || ''}",${u.managementType},${u.glucoseUnit},${u.targetGlucoseMin},${u.targetGlucoseMax},${u.carbRatio},${u.correctionFactor},${u.insulinSensitivity}\n`;
    });

    auditLog.log(req.user._id.toString(), 'export.anonymized', null, 'Exported anonymized research data');

    res.header('Content-Type', 'text/csv');
    res.attachment('anonymized_research_data.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

const announcementSchema = z.object({
  title: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(600),
  type: z.enum(['info', 'success', 'warning', 'error']).optional(),
  active: z.boolean().optional(),
  audience: z.enum(['all', 'patient', 'doctor', 'admin']).optional(),
  startAt: z.union([z.string(), z.date()]).optional(),
  endAt: z.union([z.string(), z.date(), z.null()]).optional(),
}).strict();

const announcementPatchSchema = announcementSchema.partial();

// Announcements
async function listAnnouncements(req, res, next) {
  try {
    res.json({ announcements: await announcementStore.listAnnouncements() });
  } catch (error) {
    next(error);
  }
}

async function createAnnouncement(req, res, next) {
  try {
    const payload = parseOrThrow(announcementSchema, req.body);
    const announcement = await announcementStore.createAnnouncement(payload);
    auditLog.log(req.user._id.toString(), 'announcement.create', announcement.id, `Created announcement: ${announcement.title}`);
    res.status(201).json({ announcement });
  } catch (error) {
    next(error);
  }
}

async function updateAnnouncement(req, res, next) {
  try {
    const payload = parseOrThrow(announcementPatchSchema, req.body);
    const announcement = await announcementStore.updateAnnouncement(req.params.id, payload);
    if (!announcement) throw new AppError('Announcement not found', 404);
    auditLog.log(req.user._id.toString(), 'announcement.update', announcement.id, `Updated announcement: ${announcement.title}`);
    res.json({ announcement });
  } catch (error) {
    next(error);
  }
}

async function deleteAnnouncement(req, res, next) {
  try {
    const success = await announcementStore.deleteAnnouncement(req.params.id);
    if (!success) throw new AppError('Announcement not found', 404);
    auditLog.log(req.user._id.toString(), 'announcement.delete', req.params.id, 'Deleted announcement');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// Settings
async function getSettings(req, res) {
  res.json({ settings: await systemSettingsStore.getSettings() });
}

async function updateSettings(req, res) {
  const settings = await systemSettingsStore.updateSettings(req.body);
  auditLog.log(req.user._id.toString(), 'settings.update', null, 'Updated system settings');
  res.json({ settings });
}

// --- MISSING ADMIN ENDPOINTS ---

async function getSubscriptions(req, res, next) {
  try {
    const Subscription = require('../models/Subscription');
    const subscriptions = await Subscription.find({}).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: subscriptions });
  } catch (error) { next(error); }
}

async function updateSubscription(req, res, next) {
  try {
    const Subscription = require('../models/Subscription');
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    auditLog.log(req.user._id.toString(), 'admin.subscription.update', req.params.id, `Admin updated subscription`);
    res.json({ success: true, data: subscription });
  } catch (error) { next(error); }
}

async function getPayments(req, res, next) {
  try {
    const Payment = require('../models/Payment');
    const payments = await Payment.find({}).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: payments });
  } catch (error) { next(error); }
}

async function getEmailLogs(req, res, next) {
  try {
    const logs = [
      { id: 1, to: 'user1@example.com', subject: 'Password Reset', status: 'delivered', provider: 'resend', sentAt: new Date() }
    ];
    res.json({ success: true, data: logs });
  } catch (error) { next(error); }
}

async function getFeatureFlags(req, res, next) {
  try {
    const flags = {
      advanced_what_if: true,
      beta_food_vision: false,
      subscriptions_enabled: true,
      doctor_requests_enabled: true
    };
    res.json({ success: true, data: flags });
  } catch (error) { next(error); }
}

async function updateFeatureFlags(req, res, next) {
  try {
    auditLog.log(req.user._id.toString(), 'admin.feature_flags.update', null, `Admin updated feature flags`);
    res.json({ success: true, data: req.body });
  } catch (error) { next(error); }
}

module.exports = {
  createAnnouncement,
  deleteAnnouncement,
  deleteUser,
  exportAnonymized,
  exportUsers,
  getAudit,
  getSettings,
  getUser,
  impersonateUser,
  listAnnouncements,
  listUsers,
  resetPassword,
  stats,
  systemInfo,
  updateAnnouncement,
  updateSettings,
  updateUser,
  verifyAuditIntegrity,
  getSubscriptions,
  updateSubscription,
  getPayments,
  getEmailLogs,
  getFeatureFlags,
  updateFeatureFlags,
};
