const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

// Public: list all plans
router.get('/plans', subscriptionController.getPlans);

// Protected: patient subscription status
router.get('/me', protect, subscriptionController.getMySubscription);

// Protected: create checkout session
router.post('/create-checkout-session', protect, subscriptionController.createCheckoutSession);

// Protected: cancel subscription
router.post('/cancel', protect, subscriptionController.cancelSubscription);

// Protected: mock activation (dev/test only)
router.post('/activate-mock', protect, subscriptionController.activateMock);

// Protected: process local simulated payment
router.post('/process-local-payment', protect, subscriptionController.processLocalPayment);

// Stripe webhook — raw body is handled in app.js BEFORE express.json()
router.post('/webhook', subscriptionController.handleWebhook);

module.exports = router;
