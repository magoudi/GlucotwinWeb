const express = require('express');
const glucoTwinController = require('../controllers/glucoTwinController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', glucoTwinController.dashboard);
router.get('/adaptation', glucoTwinController.adaptation);
router.get('/analytics', glucoTwinController.analytics);
router.get('/timeline', glucoTwinController.timeline);
router.get('/models', glucoTwinController.models);
router.post('/bolus/predict', glucoTwinController.predictBolus);
router.post('/basal/generate', glucoTwinController.generateBasal);
router.post('/food/recommend', glucoTwinController.recommendFood);
router.post('/what-if', glucoTwinController.runWhatIf);

router.get('/treatment-plans/pending', glucoTwinController.getPendingPlan);
router.get('/treatment-plans', glucoTwinController.listPlans);
router.post('/treatment-plans/:id/dismiss', glucoTwinController.dismissPlan);
router.post('/treatment-plans/:id/accept', glucoTwinController.acceptPlan);

module.exports = router;
