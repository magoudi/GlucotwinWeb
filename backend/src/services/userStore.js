const User = require('../models/User');
const AppError = require('../utils/AppError');
const { useInMemoryDb } = require('../config/env');

const memoryUsersById = new Map();
const memoryUserIdsByEmail = new Map();

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function getMemoryUserById(id) {
  return memoryUsersById.get(String(id)) || null;
}

function indexMemoryUser(user) {
  memoryUsersById.set(user._id.toString(), user);
  memoryUserIdsByEmail.set(normalizeEmail(user.email), user._id.toString());
  return user;
}

function restoreUserSnapshot(user, snapshot) {
  user.set(snapshot);
  user.passwordHash = snapshot.passwordHash;
  user.createdAt = snapshot.createdAt;
  user.updatedAt = snapshot.updatedAt;
}

async function createUser(input) {
  if (input.role === 'admin') {
    const existingAdminCount = await countUsersByRole('admin');

    if (existingAdminCount >= 1) {
      throw new AppError('Only one admin account is allowed', 400);
    }
  }

  if (!useInMemoryDb) {
    const user = new User(input);
    await user.setPassword(input.password);
    await user.save();
    return user;
  }

  const email = normalizeEmail(input.email);

  if (memoryUserIdsByEmail.has(email)) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = new User({
    ...input,
    email,
  });

  await user.setPassword(input.password);

  const now = new Date();
  user.createdAt = now;
  user.updatedAt = now;

  await user.validate();
  return indexMemoryUser(user);
}

async function findByEmailForAuth(email) {
  if (!useInMemoryDb) {
    return User.findOne({ email }).select('+passwordHash');
  }

  const userId = memoryUserIdsByEmail.get(normalizeEmail(email));
  return userId ? getMemoryUserById(userId) : null;
}

async function findByLoginForAuth(identifier) {
  const normalized = normalizeEmail(identifier);

  if (!useInMemoryDb) {
    return User.findOne({
      $or: [
        { email: normalized },
        { username: normalized },
      ],
    }).select('+passwordHash');
  }

  const userId = memoryUserIdsByEmail.get(normalized);
  if (userId) {
    return getMemoryUserById(userId);
  }

  return (
    Array.from(memoryUsersById.values()).find(
      (user) => normalizeEmail(user.username || '') === normalized,
    ) || null
  );
}


async function findById(id) {
  if (!useInMemoryDb) {
    return User.findById(id);
  }

  return getMemoryUserById(id);
}

async function findByIdForAuth(id) {
  if (!useInMemoryDb) {
    return User.findById(id).select('+passwordHash');
  }

  return getMemoryUserById(id);
}

async function updateById(id, updates) {
  if (!useInMemoryDb) {
    return User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  }

  const user = getMemoryUserById(id);

  if (!user) {
    return null;
  }

  const snapshot = user.toObject();
  user.set(updates);
  user.updatedAt = new Date();

  try {
    await user.validate();
    return indexMemoryUser(user);
  } catch (error) {
    restoreUserSnapshot(user, snapshot);
    throw error;
  }
}

async function saveUser(user) {
  if (!useInMemoryDb) {
    await user.save();
    return user;
  }

  const snapshot = user.toObject();
  user.updatedAt = new Date();

  try {
    await user.validate();
    return indexMemoryUser(user);
  } catch (error) {
    restoreUserSnapshot(user, snapshot);
    throw error;
  }
}

async function listAllUsers(search) {
  if (!useInMemoryDb) {
    const filter = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    return User.find(filter).sort({ createdAt: -1 });
  }

  let users = Array.from(memoryUsersById.values());

  if (search) {
    const q = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }

  return users.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

async function deleteById(id) {
  if (!useInMemoryDb) {
    return User.findByIdAndDelete(id);
  }

  const user = getMemoryUserById(id);

  if (!user) {
    return null;
  }

  memoryUsersById.delete(String(id));
  memoryUserIdsByEmail.delete(normalizeEmail(user.email));
  return user;
}

function countByRole() {
  if (!useInMemoryDb) {
    return User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
  }

  const counts = {};
  for (const user of memoryUsersById.values()) {
    counts[user.role] = (counts[user.role] || 0) + 1;
  }

  return Object.entries(counts).map(([_id, count]) => ({ _id, count }));
}

function totalCount() {
  if (!useInMemoryDb) {
    return User.countDocuments();
  }

  return memoryUsersById.size;
}

function countUsersByRole(role, excludeId) {
  if (!useInMemoryDb) {
    const filter = { role };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    return User.countDocuments(filter);
  }

  return Array.from(memoryUsersById.values()).filter((user) => {
    if (user.role !== role) {
      return false;
    }

    if (excludeId && user._id.toString() === String(excludeId)) {
      return false;
    }

    return true;
  }).length;
}

async function ensureDemoUser() {
  if (!useInMemoryDb) {
    return;
  }

  if (!memoryUserIdsByEmail.has('glucotwin@example.com')) {
    await createUser({
      fullName: 'GlucoTwin Demo',
      email: 'glucotwin@example.com',
      password: 'DemoPass123!',
      role: 'patient',
      diabetesType: 'Type 1 Diabetes',
      managementType: 'pump',
      glucoseUnit: 'mg/dL',
    });
  }

  if (!memoryUserIdsByEmail.has('admin@glucotwin.com')) {
    await createUser({
      fullName: 'GlucoTwin Admin',
      email: 'admin@glucotwin.com',
      password: 'AdminPass123!',
      role: 'admin',
      diabetesType: '',
      managementType: 'unknown',
      glucoseUnit: 'mg/dL',
    });
  }

  if (!memoryUserIdsByEmail.has('doctor@glucotwin.com')) {
    await createUser({
      fullName: 'Dr. Sarah Jenkins',
      email: 'doctor@glucotwin.com',
      password: 'DoctorPass123!',
      role: 'doctor',
      diabetesType: '',
      managementType: 'unknown',
      glucoseUnit: 'mg/dL',
    });
  }
}

function getDatabaseMode() {
  return useInMemoryDb ? 'in-memory' : 'mongodb';
}

module.exports = {
  countByRole,
  countUsersByRole,
  createUser,
  deleteById,
  ensureDemoUser,
  findByEmailForAuth,
  findByLoginForAuth,
  findById,
  findByIdForAuth,
  getDatabaseMode,
  listAllUsers,
  saveUser,
  totalCount,
  updateById,
};
