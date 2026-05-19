const express = require('express');
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get('/stats', adminController.stats);
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/reset-password', adminController.resetPassword);
router.post('/users/:id/impersonate', adminController.impersonateUser);

// Exports
router.get('/export/users', adminController.exportUsers);
router.get('/export/anonymized', adminController.exportAnonymized);

// Announcements
router.get('/announcements', adminController.listAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.patch('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

// Settings
router.get('/settings', adminController.getSettings);
router.patch('/settings', adminController.updateSettings);

router.get('/audit', adminController.getAudit);
router.get('/audit/verify-integrity', adminController.verifyAuditIntegrity);
router.get('/system', adminController.systemInfo);

module.exports = router;
