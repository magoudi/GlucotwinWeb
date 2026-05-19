/**
 * GlucoTwin Subscription Plans Configuration
 * All amounts are in the smallest currency unit (piasters for EGP).
 * 199 EGP = 19900 piasters.
 */

const PLANS = {
  standard: {
    name: 'Standard',
    description: 'Basic diabetes tracking and digital twin access for normal patient use.',
    features: [
      'Patient dashboard',
      'Profile management',
      'Basic glucose analytics',
      'Timeline',
      'Basic bolus prediction',
      'Basic food recommendation',
      'Care team page',
      'Doctor supervision request',
    ],
  },
  premium: {
    name: 'Premium',
    description: 'Advanced diabetes insights and improved digital twin tools.',
    features: [
      'Everything in Standard',
      'Advanced analytics',
      'What-if simulator',
      'Basal schedule recommendations',
      'AI models overview',
      'Adaptation page',
      'Priority doctor supervision requests',
      'More detailed prediction explanations',
    ],
  },
  vip: {
    name: 'VIP',
    description: 'Full GlucoTwin experience with premium doctor support and advanced monitoring.',
    features: [
      'Everything in Premium',
      'VIP clinical review request priority',
      'Advanced what-if simulator',
      'Advanced digital twin adaptation insights',
      'Full reports',
      'Faster doctor response priority flag',
      'Premium care team visibility',
      'Early access feature flags',
    ],
  },
};

const PACKAGES = {
  standard_monthly: {
    plan: 'standard',
    billingPeriod: 'monthly',
    amount: 0,
    displayAmount: 0,
    currency: 'egp',
    durationDays: 30,
    label: 'Monthly',
  },
  standard_6months: {
    plan: 'standard',
    billingPeriod: 'six_months',
    amount: 0,
    displayAmount: 0,
    currency: 'egp',
    durationDays: 180,
    label: '6 Months',
  },
  standard_yearly: {
    plan: 'standard',
    billingPeriod: 'yearly',
    amount: 0,
    displayAmount: 0,
    currency: 'egp',
    durationDays: 365,
    label: 'Yearly',
  },
  premium_monthly: {
    plan: 'premium',
    billingPeriod: 'monthly',
    amount: 34900,
    displayAmount: 349,
    currency: 'egp',
    durationDays: 30,
    label: 'Monthly',
  },
  premium_6months: {
    plan: 'premium',
    billingPeriod: 'six_months',
    amount: 179900,
    displayAmount: 1799,
    currency: 'egp',
    durationDays: 180,
    label: '6 Months',
  },
  premium_yearly: {
    plan: 'premium',
    billingPeriod: 'yearly',
    amount: 319900,
    displayAmount: 3199,
    currency: 'egp',
    durationDays: 365,
    label: 'Yearly',
  },
  vip_monthly: {
    plan: 'vip',
    billingPeriod: 'monthly',
    amount: 59900,
    displayAmount: 599,
    currency: 'egp',
    durationDays: 30,
    label: 'Monthly',
  },
  vip_6months: {
    plan: 'vip',
    billingPeriod: 'six_months',
    amount: 299900,
    displayAmount: 2999,
    currency: 'egp',
    durationDays: 180,
    label: '6 Months',
  },
  vip_yearly: {
    plan: 'vip',
    billingPeriod: 'yearly',
    amount: 549900,
    displayAmount: 5499,
    currency: 'egp',
    durationDays: 365,
    label: 'Yearly',
  },
};

/**
 * Feature access map per plan tier.
 * Higher tiers include all lower-tier features.
 */
const FEATURE_ACCESS = {
  standard: [
    'dashboard', 'profile', 'basicAnalytics', 'timeline',
    'basicBolusPrediction', 'basicFoodRecommendation', 'careTeam', 'doctorRequest',
  ],
  premium: [
    'dashboard', 'profile', 'basicAnalytics', 'timeline',
    'basicBolusPrediction', 'basicFoodRecommendation', 'careTeam', 'doctorRequest',
    'advancedAnalytics', 'whatIfSimulator', 'basalSchedule',
    'aiModelsOverview', 'adaptation', 'advancedExplainability', 'priorityDoctorRequest',
  ],
  vip: [
    'dashboard', 'profile', 'basicAnalytics', 'timeline',
    'basicBolusPrediction', 'basicFoodRecommendation', 'careTeam', 'doctorRequest',
    'advancedAnalytics', 'whatIfSimulator', 'basalSchedule',
    'aiModelsOverview', 'adaptation', 'advancedExplainability', 'priorityDoctorRequest',
    'vipPriority', 'fullReports', 'advancedDigitalTwin',
    'premiumCareTeam', 'earlyAccessFeatures',
  ],
};

function getPackage(packageId) {
  return PACKAGES[packageId] || null;
}

function getPlan(planName) {
  return PLANS[planName] || null;
}

function getAllPlansForFrontend() {
  return Object.entries(PLANS).map(([key, plan]) => {
    const prices = Object.entries(PACKAGES)
      .filter(([, pkg]) => pkg.plan === key)
      .map(([pkgId, pkg]) => ({
        packageId: pkgId,
        billingPeriod: pkg.billingPeriod,
        label: pkg.label,
        amount: pkg.amount,
        displayAmount: pkg.displayAmount,
        currency: pkg.currency,
        durationDays: pkg.durationDays,
      }));

    return {
      plan: key,
      name: plan.name,
      description: plan.description,
      features: plan.features,
      prices,
    };
  });
}

module.exports = {
  PLANS,
  PACKAGES,
  FEATURE_ACCESS,
  getPackage,
  getPlan,
  getAllPlansForFrontend,
};
