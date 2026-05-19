const express = require('express');
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Dashboard summary
router.get('/summary', patientController.getSummary);

// Profile
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);

// Analytics
router.get('/analytics', patientController.getAnalytics);

// Timeline
router.get('/timeline', patientController.getTimeline);

// Care Team
router.get('/care-team', patientController.getCareTeam);

// Connectors
router.get('/connectors', patientController.getConnectors);
router.post('/connectors/:type/connect', patientController.connectConnector);
router.post('/connectors/:type/disconnect', patientController.disconnectConnector);

// Treatment plan reply (accept/dismiss)
router.post('/treatment-plans/:id/reply', patientController.replyToTreatmentPlan);

// Doctor Supervision
router.get('/doctors', patientController.listAvailableDoctors);
router.get('/doctor-requests', patientController.getMyDoctorRequests);
router.post('/doctor-requests', patientController.createDoctorRequest);

module.exports = router;
