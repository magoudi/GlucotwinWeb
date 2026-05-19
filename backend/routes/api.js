const express = require('express');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const { connectDb } = require('../db');
const { defaultUserPageData } = require('../seed');

const router = express.Router();

function initialsForName(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function usernameForEmail(email) {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    initials: user.initials,
    phone: user.phone || '',
    bio: user.bio || '',
    subtitle: user.subtitle || 'Type 1 diabetes profile',
  };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, user) {
  const { hash } = hashPassword(password, user.passwordSalt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.passwordHash, 'hex'));
}

function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must include a capital letter';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must include a small letter';
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must include a number';
  }

  return '';
}

async function getRequestUser(db, req) {
  const id = req.get('x-user-id');

  if (!id || !ObjectId.isValid(id)) {
    return null;
  }

  return db.collection('users').findOne({ _id: new ObjectId(id) });
}

function profileDetailsForUser(pageData, user) {
  if (!user) {
    return pageData;
  }

  const account = publicUser(user);

  return {
    ...pageData,
    user: {
      ...pageData.user,
      initials: account.initials,
      displayName: account.fullName,
      subtitle: account.subtitle,
      username: account.username,
      email: account.email,
      phone: account.phone,
      bio: account.bio,
    },
    status: pageData.status.map((item) => {
      if (item.label === 'Email') {
        return { ...item, value: account.email };
      }

      if (item.label === 'Phone') {
        return { ...item, value: account.phone || 'Not added yet' };
      }

      return item;
    }),
  };
}

function profileSecurityForUser(pageData, user) {
  if (!user) {
    return pageData;
  }

  const changedAt = user.passwordUpdatedAt || user.createdAt;
  const passwordDetail = changedAt
    ? `Last changed ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(changedAt))}`
    : 'Password is active';

  return {
    ...pageData,
    signIn: pageData.signIn.map((item) => (
      item.method === 'Password' ? { ...item, detail: passwordDetail } : item
    )),
  };
}

function defaultPageForSlug(slug) {
  return defaultUserPageData.find((page) => page.slug === slug);
}

function cleanPageData(value) {
  if (Array.isArray(value)) {
    return value.map(cleanPageData);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const bannedKeys = new Set(['title', 'description', 'action', 'mutedAction', 'reviewTitle', 'missingTitle']);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !bannedKeys.has(key))
      .map(([key, child]) => [key, cleanPageData(child)]),
  );
}

async function createDefaultPageDataForUser(db, userId) {
  const now = new Date();
  await db.collection('userPageData').insertMany(
    defaultUserPageData.map((page) => ({
      userId,
      slug: page.slug,
      data: page.data,
      createdAt: now,
      updatedAt: now,
    })),
    { ordered: false },
  ).catch((error) => {
    if (error.code !== 11000) {
      throw error;
    }
  });
}

async function getUserPageData(db, user, slug) {
  const fallback = defaultPageForSlug(slug);

  let page = await db.collection('userPageData').findOne(
    { userId: user._id, slug },
    { projection: { _id: 0, slug: 1, data: 1 } },
  );

  if (!page && fallback) {
    await db.collection('userPageData').insertOne({
      userId: user._id,
      slug,
      data: fallback.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).catch((error) => {
      if (error.code !== 11000) {
        throw error;
      }
    });

    page = await db.collection('userPageData').findOne(
      { userId: user._id, slug },
      { projection: { _id: 0, slug: 1, data: 1 } },
    );
  }

  return page || fallback;
}

router.get('/health', async function(req, res, next) {
  try {
    const db = await connectDb();
    await db.command({ ping: 1 });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/register', async function(req, res, next) {
  try {
    const fullName = String(req.body.fullName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!fullName || !email || !password) {
      res.status(400).json({ error: 'Full name, email, and password are required' });
      return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      res.status(400).json({ error: passwordError });
      return;
    }

    const db = await connectDb();
    const users = db.collection('users');
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const { salt, hash } = hashPassword(password);
    const now = new Date();
    const user = {
      fullName,
      email,
      username: usernameForEmail(email),
      initials: initialsForName(fullName),
      subtitle: 'Type 1 diabetes profile',
      phone: '',
      bio: '',
      passwordSalt: salt,
      passwordHash: hash,
      passwordUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await users.insertOne(user);
    user._id = result.insertedId;
    await createDefaultPageDataForUser(db, user._id);

    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/login', async function(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const db = await connectDb();
    const user = await db.collection('users').findOne({ email });

    if (!user || !verifyPassword(password, user)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/account/me', async function(req, res, next) {
  try {
    const db = await connectDb();
    const user = await getRequestUser(db, req);

    if (!user) {
      res.status(401).json({ error: 'Account not found' });
      return;
    }

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.patch('/account/me', async function(req, res, next) {
  try {
    const db = await connectDb();
    const user = await getRequestUser(db, req);

    if (!user) {
      res.status(401).json({ error: 'Account not found' });
      return;
    }

    const fullName = String(req.body.fullName || '').trim();
    const username = String(req.body.username || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    const phone = String(req.body.phone || '').trim();
    const bio = String(req.body.bio || '').trim();

    if (!fullName || !username) {
      res.status(400).json({ error: 'Display name and username are required' });
      return;
    }

    const update = {
      fullName,
      username,
      phone,
      bio,
      initials: initialsForName(fullName),
      updatedAt: new Date(),
    };

    await db.collection('users').updateOne({ _id: user._id }, { $set: update });

    res.json({ user: publicUser({ ...user, ...update }) });
  } catch (error) {
    next(error);
  }
});

router.patch('/account/password', async function(req, res, next) {
  try {
    const db = await connectDb();
    const user = await getRequestUser(db, req);

    if (!user) {
      res.status(401).json({ error: 'Log in before changing your password' });
      return;
    }

    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    if (!verifyPassword(currentPassword, user)) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      res.status(400).json({ error: passwordError });
      return;
    }

    if (verifyPassword(newPassword, user)) {
      res.status(400).json({ error: 'New password must be different from your current password' });
      return;
    }

    const { salt, hash } = hashPassword(newPassword);
    const now = new Date();

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          passwordSalt: salt,
          passwordHash: hash,
          passwordUpdatedAt: now,
          updatedAt: now,
        },
      },
    );

    res.json({ ok: true, passwordUpdatedAt: now });
  } catch (error) {
    next(error);
  }
});

router.get('/pages/:slug', async function(req, res, next) {
  try {
    const db = await connectDb();
    const user = await getRequestUser(db, req);

    if (!user) {
      res.status(401).json({ error: 'Log in before loading this page' });
      return;
    }

    const page = await getUserPageData(db, user, req.params.slug);

    if (!page) {
      res.status(404).json({ error: 'Page data not found' });
      return;
    }

    if (req.params.slug === 'profile-details') {
      res.json(profileDetailsForUser(page.data, user));
      return;
    }

    if (req.params.slug === 'profile-security') {
      res.json(profileSecurityForUser(page.data, user));
      return;
    }

    res.json(page.data);
  } catch (error) {
    next(error);
  }
});

router.patch('/pages/:slug', async function(req, res, next) {
  try {
    const db = await connectDb();
    const user = await getRequestUser(db, req);

    if (!user) {
      res.status(401).json({ error: 'Log in before saving changes' });
      return;
    }

    if (!defaultPageForSlug(req.params.slug)) {
      res.status(404).json({ error: 'Page data not found' });
      return;
    }

    const data = cleanPageData(req.body.data || {});

    await db.collection('userPageData').updateOne(
      { userId: user._id, slug: req.params.slug },
      {
        $set: { data, updatedAt: new Date() },
        $setOnInsert: { userId: user._id, slug: req.params.slug, createdAt: new Date() },
      },
      { upsert: true },
    );

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/profile/:section', async function(req, res, next) {
  try {
    const db = await connectDb();
    const user = await getRequestUser(db, req);

    if (!user) {
      res.status(401).json({ error: 'Log in before loading this profile' });
      return;
    }

    const page = await getUserPageData(db, user, `profile-${req.params.section}`);

    if (!page) {
      res.status(404).json({ error: 'Profile data not found' });
      return;
    }

    if (req.params.section === 'details') {
      res.json(profileDetailsForUser(page.data, user));
      return;
    }

    if (req.params.section === 'security') {
      res.json(profileSecurityForUser(page.data, user));
      return;
    }

    res.json(page.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
