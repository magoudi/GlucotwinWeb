const express = require('express');
const doctorController = require('../controllers/doctorController');

const router = express.Router();

router.get('/stats', doctorController.getStats);
router.get('/patients', doctorController.listPatients);
router.get('/patients/:id', doctorController.getPatient);
router.post('/patients/:id/impersonate', doctorController.impersonatePatient);

router.get('/patients/:id/notes', doctorController.listNotes);
router.post('/patients/:id/notes', doctorController.addNote);

router.get('/patients/:id/insights', doctorController.getInsights);
router.patch('/patients/bulk-status', doctorController.updateBulkStatus);
router.patch('/patients/:id/status', doctorController.updateStatus);

router.get('/patients/:id/treatment-plans', doctorController.listTreatmentPlans);
router.post('/patients/:id/treatment-plans', doctorController.createTreatmentPlan);
router.post('/patients/:id/treatment-plans/:planId/sign-and-send', doctorController.signAndSendTreatmentPlan);
router.post('/patients/:id/treatment-plans/:planId/reply', doctorController.replyToTreatmentPlan);

// Supervision Requests
router.get('/supervision-requests', doctorController.getSupervisionRequests);
router.post('/supervision-requests/:id/respond', doctorController.respondToSupervisionRequest);

module.exports = router;
