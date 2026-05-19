/**
 * Subscription Access Control Middleware
 *
 * requireActiveSubscription — blocks access unless patient has an active subscription.
 * requirePackageFeature(featureName) — blocks access unless patient's plan includes the feature.
 */

const { FEATURE_ACCESS } = require('../config/subscriptionPlans');
const AppError = require('../utils/AppError');

/**
 * Middleware: Require an active subscription.
 * Attach after `protect` middleware.
 */
function requireActiveSubscription(req, res, next) {
  const user = req.user;

  // Allow doctors and admins through without subscription check
  if (user.role === 'doctor' || user.role === 'admin') {
    return next();
  }

  if (!user.isSubscribed || user.subscriptionStatus !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'An active subscription is required to access this feature.',
      code: 'SUBSCRIPTION_REQUIRED',
      upgrade: true,
    });
  }

  // Check if subscription has expired
  if (user.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date()) {
    return res.status(403).json({
      success: false,
      message: 'Your subscription has expired. Please renew to continue.',
      code: 'SUBSCRIPTION_EXPIRED',
      upgrade: true,
    });
  }

  next();
}

/**
 * Middleware factory: Require a specific feature in the patient's plan.
 * Usage: requirePackageFeature('whatIfSimulator')
 */
function requirePackageFeature(featureName) {
  return (req, res, next) => {
    const user = req.user;

    // Allow doctors and admins through
    if (user.role === 'doctor' || user.role === 'admin') {
      return next();
    }

    if (!user.isSubscribed || user.subscriptionStatus !== 'active' || !user.subscriptionPlan) {
      return res.status(403).json({
        success: false,
        message: 'An active subscription is required to access this feature.',
        code: 'SUBSCRIPTION_REQUIRED',
        upgrade: true,
      });
    }

    const allowedFeatures = FEATURE_ACCESS[user.subscriptionPlan] || [];
    if (!allowedFeatures.includes(featureName)) {
      return res.status(403).json({
        success: false,
        message: `This feature requires a higher plan. Your current plan (${user.subscriptionPlan}) does not include "${featureName}".`,
        code: 'FEATURE_NOT_AVAILABLE',
        requiredFeature: featureName,
        currentPlan: user.subscriptionPlan,
        upgrade: true,
      });
    }

    next();
  };
}

module.exports = {
  requireActiveSubscription,
  requirePackageFeature,
};
