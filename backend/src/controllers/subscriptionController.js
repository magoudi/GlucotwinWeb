const { useInMemoryDb } = require('../config/env');
const { getAllPlansForFrontend, getPackage } = require('../config/subscriptionPlans');
const stripeService = require('../services/stripeService');
const auditLog = require('../services/auditLog');
const userStore = require('../services/userStore');
const AppError = require('../utils/AppError');

// Mongoose models (only used when NOT in-memory)
let SubscriptionModel, PaymentModel;
try {
  SubscriptionModel = require('../models/Subscription');
  PaymentModel = require('../models/Payment');
} catch (e) {
  // Models may fail to load if mongoose not connected
}

// In-memory stores for dev/test
const memSubscriptions = [];
const memPayments = [];

function generateId() {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ──────────────────────────────────────────────────────
// GET /api/subscriptions/plans
// ──────────────────────────────────────────────────────
async function getPlans(req, res) {
  res.json({ success: true, data: getAllPlansForFrontend() });
}

// ──────────────────────────────────────────────────────
// GET /api/subscriptions/me
// ──────────────────────────────────────────────────────
async function getMySubscription(req, res, next) {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: {
        isSubscribed: user.isSubscribed || false,
        subscriptionStatus: user.subscriptionStatus || 'none',
        subscriptionPlan: user.subscriptionPlan || null,
        subscriptionBillingPeriod: user.subscriptionBillingPeriod || null,
        subscriptionStartDate: user.subscriptionStartDate || null,
        subscriptionEndDate: user.subscriptionEndDate || null,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ──────────────────────────────────────────────────────
// POST /api/subscriptions/create-checkout-session
// ──────────────────────────────────────────────────────
async function createCheckoutSession(req, res, next) {
  try {
    const packageId = String(req.body.packageId || '').trim();
    const pkg = getPackage(packageId);

    if (!pkg) {
      throw new AppError('Invalid package ID.', 400, 'INVALID_PACKAGE');
    }

    const user = req.user;
    const userId = user._id.toString();

    // Get or create Stripe customer
    const customerId = await stripeService.getOrCreateCustomer(user);

    // Save Stripe customer ID on user
    if (!user.stripeCustomerId || user.stripeCustomerId !== customerId) {
      user.stripeCustomerId = customerId;
      await userStore.saveUser(user);
    }

    // Create local Payment record
    let payment;
    if (!useInMemoryDb && PaymentModel) {
      payment = new PaymentModel({
        userId: user._id,
        packageId,
        provider: stripeService.isLiveMode() ? 'stripe' : 'mock',
        amount: pkg.amount,
        currency: pkg.currency,
        status: 'pending',
        stripeCustomerId: customerId,
      });
      await payment.save();
    } else {
      payment = {
        _id: generateId(),
        id: null,
        userId,
        packageId,
        provider: stripeService.isLiveMode() ? 'stripe' : 'mock',
        amount: pkg.amount,
        currency: pkg.currency,
        status: 'pending',
        stripeCustomerId: customerId,
        createdAt: new Date(),
      };
      payment.id = payment._id;
      memPayments.push(payment);
    }

    // Create local Subscription record
    let subscription;
    if (!useInMemoryDb && SubscriptionModel) {
      subscription = new SubscriptionModel({
        userId: user._id,
        plan: pkg.plan,
        packageId,
        billingPeriod: pkg.billingPeriod,
        status: 'pending',
        amount: pkg.amount,
        currency: pkg.currency,
        stripeCustomerId: customerId,
        latestPaymentId: payment._id,
      });
      await subscription.save();
    } else {
      subscription = {
        _id: generateId(),
        id: null,
        userId,
        plan: pkg.plan,
        packageId,
        billingPeriod: pkg.billingPeriod,
        status: 'pending',
        amount: pkg.amount,
        currency: pkg.currency,
        stripeCustomerId: customerId,
        latestPaymentId: payment._id,
        createdAt: new Date(),
      };
      subscription.id = subscription._id;
      memSubscriptions.push(subscription);
    }

    const paymentId = payment._id ? payment._id.toString() : payment.id;
    const subscriptionId = subscription._id ? subscription._id.toString() : subscription.id;

    // Bypass Stripe for free packages
    if (pkg.amount === 0) {
      await handleCheckoutCompleted({
        metadata: {
          userId,
          packageId,
          localPaymentId: paymentId,
          localSubscriptionId: subscriptionId
        }
      }, `free_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

      return res.json({ success: true, url: '/subscription-success?session_id=free' });
    }

    // Create Stripe Checkout Session
    const session = await stripeService.createCheckoutSession({
      customer: customerId,
      packageId,
      userId,
      localPaymentId: paymentId,
      localSubscriptionId: subscriptionId,
    });

    // Store session ID on records
    if (!useInMemoryDb && SubscriptionModel) {
      subscription.stripeCheckoutSessionId = session.id;
      await subscription.save();
      payment.stripeCheckoutSessionId = session.id;
      await payment.save();
    } else {
      subscription.stripeCheckoutSessionId = session.id;
      payment.stripeCheckoutSessionId = session.id;
    }

    await auditLog.log(userId, 'subscription.checkout_created', subscriptionId, `Checkout created for ${packageId}`);

    res.json({ success: true, url: session.url });
  } catch (error) {
    next(error);
  }
}

// ──────────────────────────────────────────────────────
// POST /api/subscriptions/webhook
// ──────────────────────────────────────────────────────
async function handleWebhook(req, res) {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    // Use raw body buffer for Stripe signature verification
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    event = stripeService.constructWebhookEvent(rawBody, signature);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ success: false, message: 'Webhook signature invalid', code: 'PAYMENT_WEBHOOK_INVALID' });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(event.data.object, event.id);
    } else if (event.type === 'checkout.session.expired') {
      await handleCheckoutExpired(event.data.object);
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  // Always return 200 to Stripe
  res.json({ received: true });
}

async function handleCheckoutCompleted(session, eventId) {
  const { userId, packageId, localPaymentId, localSubscriptionId } = session.metadata || {};
  if (!userId || !packageId) return;

  const pkg = getPackage(packageId);
  if (!pkg) return;

  const now = new Date();
  const endDate = new Date(now.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000);

  // Update Payment
  if (!useInMemoryDb && PaymentModel) {
    const existing = await PaymentModel.findOne({ rawEventId: eventId });
    if (existing) return; // Idempotent: already processed

    await PaymentModel.findByIdAndUpdate(localPaymentId, {
      status: 'succeeded',
      paidAt: now,
      stripePaymentIntentId: session.payment_intent || null,
      rawEventId: eventId,
    });
  } else {
    const payment = memPayments.find(p => p._id === localPaymentId || p.id === localPaymentId);
    if (payment) {
      if (payment.rawEventId === eventId) return; // Idempotent
      payment.status = 'succeeded';
      payment.paidAt = now;
      payment.rawEventId = eventId;
    }
  }

  // Update Subscription
  if (!useInMemoryDb && SubscriptionModel) {
    await SubscriptionModel.findByIdAndUpdate(localSubscriptionId, {
      status: 'active',
      startDate: now,
      endDate,
    });
  } else {
    const sub = memSubscriptions.find(s => s._id === localSubscriptionId || s.id === localSubscriptionId);
    if (sub) {
      sub.status = 'active';
      sub.startDate = now;
      sub.endDate = endDate;
    }
  }

  // Update User
  const user = await userStore.findById(userId);
  if (user) {
    user.isSubscribed = true;
    user.subscriptionStatus = 'active';
    user.subscriptionPlan = pkg.plan;
    user.subscriptionBillingPeriod = pkg.billingPeriod;
    user.subscriptionStartDate = now;
    user.subscriptionEndDate = endDate;
    await userStore.saveUser(user);
  }

  await auditLog.log(userId, 'subscription.activated', localSubscriptionId, `Subscription ${packageId} activated`);
}

async function handleCheckoutExpired(session) {
  const { localPaymentId, localSubscriptionId } = session.metadata || {};

  if (!useInMemoryDb && PaymentModel) {
    await PaymentModel.findByIdAndUpdate(localPaymentId, { status: 'cancelled' });
  } else {
    const payment = memPayments.find(p => p._id === localPaymentId);
    if (payment) payment.status = 'cancelled';
  }

  if (!useInMemoryDb && SubscriptionModel) {
    const sub = await SubscriptionModel.findById(localSubscriptionId);
    if (sub && sub.status === 'pending') {
      sub.status = 'cancelled';
      await sub.save();
    }
  } else {
    const sub = memSubscriptions.find(s => s._id === localSubscriptionId);
    if (sub && sub.status === 'pending') sub.status = 'cancelled';
  }
}

// ──────────────────────────────────────────────────────
// POST /api/subscriptions/activate-mock
// Used in mock mode to simulate webhook activation
// ──────────────────────────────────────────────────────
async function activateMock(req, res, next) {
  try {
    const sessionId = String(req.body.sessionId || '').trim();
    if (!sessionId) {
      throw new AppError('Session ID is required.', 400, 'VALIDATION_ERROR');
    }

    // Find the subscription by checkout session ID
    let subscription;
    if (!useInMemoryDb && SubscriptionModel) {
      subscription = await SubscriptionModel.findOne({ stripeCheckoutSessionId: sessionId });
    } else {
      subscription = memSubscriptions.find(s => s.stripeCheckoutSessionId === sessionId);
    }

    if (!subscription) {
      throw new AppError('Subscription not found for this session.', 404, 'SUBSCRIPTION_NOT_FOUND');
    }

    if (subscription.status === 'active') {
      return res.json({ success: true, message: 'Already activated.' });
    }

    const pkg = getPackage(subscription.packageId);
    if (!pkg) throw new AppError('Package not found.', 400, 'INVALID_PACKAGE');

    const now = new Date();
    const endDate = new Date(now.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000);

    // Update subscription
    subscription.status = 'active';
    subscription.startDate = now;
    subscription.endDate = endDate;
    if (!useInMemoryDb && SubscriptionModel) {
      await subscription.save();
    }

    // Update payment
    const paymentId = subscription.latestPaymentId;
    if (!useInMemoryDb && PaymentModel) {
      await PaymentModel.findByIdAndUpdate(paymentId, { status: 'succeeded', paidAt: now });
    } else {
      const payment = memPayments.find(p => p._id === paymentId || p.id === paymentId);
      if (payment) { payment.status = 'succeeded'; payment.paidAt = now; }
    }

    // Update user
    const userId = subscription.userId ? subscription.userId.toString() : subscription.userId;
    const user = await userStore.findById(userId);
    if (user) {
      user.isSubscribed = true;
      user.subscriptionStatus = 'active';
      user.subscriptionPlan = pkg.plan;
      user.subscriptionBillingPeriod = pkg.billingPeriod;
      user.subscriptionStartDate = now;
      user.subscriptionEndDate = endDate;
      await userStore.saveUser(user);
    }

    await auditLog.log(userId, 'subscription.activated', subscription._id?.toString() || subscription.id, `Mock activation for ${subscription.packageId}`);

    res.json({ success: true, message: 'Subscription activated (mock).' });
  } catch (error) {
    next(error);
  }
}

// ──────────────────────────────────────────────────────
// POST /api/subscriptions/cancel
// ──────────────────────────────────────────────────────
async function cancelSubscription(req, res, next) {
  try {
    const user = req.user;
    const userId = user._id.toString();

    if (!user.isSubscribed || user.subscriptionStatus !== 'active') {
      throw new AppError('No active subscription to cancel.', 400, 'SUBSCRIPTION_NOT_FOUND');
    }

    // Find active subscription
    let subscription;
    if (!useInMemoryDb && SubscriptionModel) {
      subscription = await SubscriptionModel.findOne({ userId: user._id, status: 'active' }).sort({ createdAt: -1 });
      if (subscription) {
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        await subscription.save();
      }
    } else {
      subscription = memSubscriptions.find(s => s.userId === userId && s.status === 'active');
      if (subscription) {
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
      }
    }

    // Update user
    user.subscriptionStatus = 'cancelled';
    user.isSubscribed = false;
    await userStore.saveUser(user);

    await auditLog.log(userId, 'subscription.cancelled', subscription?._id?.toString() || '', 'Patient cancelled subscription');

    res.json({ success: true, message: 'Subscription cancelled successfully.' });
  } catch (error) {
    next(error);
  }
}

// ──────────────────────────────────────────────────────
// POST /api/subscriptions/process-local-payment
// ──────────────────────────────────────────────────────
async function processLocalPayment(req, res, next) {
  try {
    const packageId = String(req.body.packageId || '').trim();
    const pkg = getPackage(packageId);

    if (!pkg) {
      throw new AppError('Invalid package ID.', 400, 'INVALID_PACKAGE');
    }

    const user = req.user;
    const userId = user._id.toString();

    // Create local Payment record
    let payment;
    if (!useInMemoryDb && PaymentModel) {
      payment = new PaymentModel({
        userId: user._id,
        packageId,
        provider: 'mock',
        amount: pkg.amount,
        currency: pkg.currency,
        status: 'pending',
        stripeCustomerId: user.stripeCustomerId || 'mock_cust_' + generateId(),
      });
      await payment.save();
    } else {
      payment = {
        _id: generateId(),
        id: null,
        userId,
        packageId,
        provider: 'mock',
        amount: pkg.amount,
        currency: pkg.currency,
        status: 'pending',
        stripeCustomerId: user.stripeCustomerId || 'mock_cust_' + generateId(),
        createdAt: new Date(),
      };
      payment.id = payment._id;
      memPayments.push(payment);
    }

    // Create local Subscription record
    let subscription;
    if (!useInMemoryDb && SubscriptionModel) {
      subscription = new SubscriptionModel({
        userId: user._id,
        plan: pkg.plan,
        packageId,
        billingPeriod: pkg.billingPeriod,
        status: 'pending',
        amount: pkg.amount,
        currency: pkg.currency,
        stripeCustomerId: payment.stripeCustomerId,
        latestPaymentId: payment._id,
      });
      await subscription.save();
    } else {
      subscription = {
        _id: generateId(),
        id: null,
        userId,
        plan: pkg.plan,
        packageId,
        billingPeriod: pkg.billingPeriod,
        status: 'pending',
        amount: pkg.amount,
        currency: pkg.currency,
        stripeCustomerId: payment.stripeCustomerId,
        latestPaymentId: payment._id,
        createdAt: new Date(),
      };
      subscription.id = subscription._id;
      memSubscriptions.push(subscription);
    }

    const paymentId = payment._id ? payment._id.toString() : payment.id;
    const subscriptionId = subscription._id ? subscription._id.toString() : subscription.id;

    // Instantly activate it
    await handleCheckoutCompleted({
      metadata: {
        userId,
        packageId,
        localPaymentId: paymentId,
        localSubscriptionId: subscriptionId
      }
    }, `mock_evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

    res.json({ success: true, message: 'Local payment processed successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPlans,
  getMySubscription,
  createCheckoutSession,
  handleWebhook,
  cancelSubscription,
  activateMock,
  processLocalPayment,
};
