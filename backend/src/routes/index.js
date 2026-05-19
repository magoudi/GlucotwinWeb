const express = require('express');
const adminRoutes = require('./adminRoutes');
const doctorRoutes = require('./doctorRoutes');
const patientRoutes = require('./patientRoutes');
const authRoutes = require('./authRoutes');
const glucoTwinRoutes = require('./glucoTwinRoutes');
const userRoutes = require('./userRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const userStore = require('../services/userStore');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { requireDoctor } = require('../middleware/doctorMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, database: userStore.getDatabaseMode() });
});

router.get('/announcements/active', async (req, res, next) => {
  const { getActiveAnnouncements } = require('../services/announcementStore');
  try {
    res.json({ announcements: await getActiveAnnouncements() });
  } catch (error) {
    next(error);
  }
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/glucotwin', glucoTwinRoutes);

// Patient routes (Protected by jwt)
router.use('/patient', patientRoutes);

// Subscription routes (mix of public & protected)
router.use('/subscriptions', subscriptionRoutes);

// Admin routes (Protected by jwt and role)
router.use('/admin', protect, requireAdmin, adminRoutes);

// Clinical routes (Protected by jwt and role)
router.use('/doctor', protect, requireDoctor, doctorRoutes);

// Backward-compatible aliases for the previous frontend API names.
router.use('/account', userRoutes);

module.exports = router;
