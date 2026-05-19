/**
 * Stripe Service
 * Wraps Stripe SDK calls. Falls back to mock mode if STRIPE_SECRET_KEY is not set.
 *
 * TODO: For production:
 * 1. Set STRIPE_SECRET_KEY to your live key (sk_live_xxx)
 * 2. Set STRIPE_WEBHOOK_SECRET from your Stripe dashboard webhook settings
 * 3. Switch from test mode to live mode in your Stripe dashboard
 */

const { getPackage } = require('../config/subscriptionPlans');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

let stripe = null;

if (STRIPE_SECRET_KEY) {
  const Stripe = require('stripe');
  stripe = new Stripe(STRIPE_SECRET_KEY);
}

function isLiveMode() {
  return !!stripe;
}

/**
 * Create or retrieve a Stripe customer for the user.
 */
async function getOrCreateCustomer(user) {
  if (!stripe) return `mock_cus_${user._id}`;

  if (user.stripeCustomerId) {
    try {
      await stripe.customers.retrieve(user.stripeCustomerId);
      return user.stripeCustomerId;
    } catch (e) {
      // Customer was deleted, create a new one
    }
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.fullName,
    metadata: { userId: user._id.toString() },
  });

  return customer.id;
}

/**
 * Create a Stripe Checkout Session for a one-time payment.
 */
async function createCheckoutSession({ customer, packageId, userId, localPaymentId, localSubscriptionId }) {
  const pkg = getPackage(packageId);
  if (!pkg) throw new Error('Invalid package');

  const successUrl = `${FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${FRONTEND_URL}/subscription/cancel`;

  const metadata = {
    userId: String(userId),
    packageId: String(packageId),
    localPaymentId: String(localPaymentId),
    localSubscriptionId: String(localSubscriptionId),
  };

  if (!stripe) {
    // Mock mode: return a fake checkout URL that redirects to success
    const mockSessionId = `mock_cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      id: mockSessionId,
      url: `${FRONTEND_URL}/subscription/success?session_id=${mockSessionId}&mock=true`,
      metadata,
    };
  }

  // Check if there's a Stripe Price ID in env for this package
  const envKey = `STRIPE_PRICE_${packageId.toUpperCase()}`;
  const stripePriceId = process.env[envKey];

  let lineItems;
  if (stripePriceId) {
    lineItems = [{ price: stripePriceId, quantity: 1 }];
  } else {
    // Use dynamic price_data
    lineItems = [{
      price_data: {
        currency: pkg.currency,
        product_data: {
          name: `GlucoTwin ${pkg.plan.charAt(0).toUpperCase() + pkg.plan.slice(1)} — ${pkg.label}`,
          description: `${pkg.label} subscription to GlucoTwin ${pkg.plan} plan`,
        },
        unit_amount: pkg.amount,
      },
      quantity: 1,
    }];
  }

  const session = await stripe.checkout.sessions.create({
    customer,
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });

  return session;
}

/**
 * Verify and construct a Stripe webhook event.
 */
function constructWebhookEvent(rawBody, signature) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe is not configured for webhook verification');
  }
  return stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
}

module.exports = {
  isLiveMode,
  getOrCreateCustomer,
  createCheckoutSession,
  constructWebhookEvent,
};
